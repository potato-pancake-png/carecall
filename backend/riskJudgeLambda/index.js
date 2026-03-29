// ✓ c2 - RiskJudge Lambda: Transcribe 텍스트 + Comprehend 감정 분석 결과를 Bedrock으로 종합 위험도 판단
// ✓ c3 - 위험도 '위험'/'주의' 시 SNS 알림 발송 및 DynamoDB 저장
'use strict';

const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { ComprehendClient, DetectSentimentCommand } = require('@aws-sdk/client-comprehend');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { DatabaseError, ExternalServiceError, ValidationError, AppError } = require('../errors/AppError');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
const comprehend = new ComprehendClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
const sns = new SNSClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });

const CALL_RECORDS_TABLE = process.env.CALL_RECORDS_TABLE || 'WelfareCallRecords';
const SNS_ALERT_TOPIC_ARN = process.env.SNS_ALERT_TOPIC_ARN;
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

/**
 * Amazon Comprehend로 텍스트 감정 분석을 수행한다.
 * @param {string} text - 분석할 텍스트
 * @returns {Promise<Object>} { sentiment, sentimentScore }
 */
async function analyzeWithComprehend(text) {
  try {
    const result = await comprehend.send(
      new DetectSentimentCommand({ Text: text, LanguageCode: 'ko' })
    );
    return {
      sentiment: result.Sentiment,
      sentimentScore: result.SentimentScore,
    };
  } catch (err) {
    throw new ExternalServiceError(`Comprehend 감정 분석 실패: ${err.message}`);
  }
}

/**
 * Amazon Bedrock (Claude)으로 통화 텍스트와 감정 분석 결과를 종합하여 위험도를 판단한다.
 * ✓ c2 - Bedrock에 Transcribe 텍스트와 Comprehend 결과를 전달하여 정상/주의/위험 반환
 * @param {string} transcribedText - Transcribe 변환 텍스트
 * @param {Object} comprehendResult - Comprehend 감정 분석 결과
 * @returns {Promise<string>} '정상' | '주의' | '위험'
 */
async function judgeRiskWithBedrock(transcribedText, comprehendResult) {
  const prompt = `당신은 독거노인 안부 통화 분석 전문가입니다.
아래 통화 내용과 감정 분석 결과를 바탕으로 위험도를 판단하세요.

통화 내용:
${transcribedText}

감정 분석 결과:
- 주요 감정: ${comprehendResult.sentiment}
- 감정 점수: ${JSON.stringify(comprehendResult.sentimentScore)}

위험도 기준:
- 정상: 건강 상태 양호, 일상적 대화, 긍정적/중립적 감정
- 주의: 다소 부정적 감정, 가벼운 불편 호소, 주기적 확인 필요
- 위험: 심한 우울/절망 표현, 건강 이상 징후, 무응답 또는 비정상 응답, 긴급 도움 요청

반드시 아래 형식으로만 응답하세요 (다른 텍스트 없이):
{"riskLevel": "정상" | "주의" | "위험", "reason": "판단 근거 한 문장"}`;

  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    };

    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      })
    );

    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));
    const text = responseBody.content[0].text.trim();
    const parsed = JSON.parse(text);

    if (!['정상', '주의', '위험'].includes(parsed.riskLevel)) {
      throw new ExternalServiceError('Bedrock 응답의 riskLevel 값이 올바르지 않습니다.');
    }

    return { riskLevel: parsed.riskLevel, reason: parsed.reason || '' };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new ExternalServiceError(`Bedrock 위험도 판단 실패: ${err.message}`);
  }
}

/**
 * SNS를 통해 담당 복지사에게 알림을 발송한다.
 * ✓ c3 - 위험도 '위험' 또는 '주의' 시 SNS 알림 발송
 * @param {Object} alertData - { recipientId, recipientName, riskLevel, reason, contactId }
 */
async function sendSnsAlert(alertData) {
  if (!SNS_ALERT_TOPIC_ARN) {
    throw new ExternalServiceError('SNS_ALERT_TOPIC_ARN 환경 변수가 설정되지 않았습니다.');
  }
  try {
    const message = `[안부전화 알림] 위험도: ${alertData.riskLevel}
대상자: ${alertData.recipientName} (ID: ${alertData.recipientId})
판단 근거: ${alertData.reason}
통화 ID: ${alertData.contactId}
시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

    await sns.send(
      new PublishCommand({
        TopicArn: SNS_ALERT_TOPIC_ARN,
        Subject: `[긴급알림] ${alertData.recipientName} 위험도 ${alertData.riskLevel} 감지`,
        Message: message,
        MessageAttributes: {
          riskLevel: { DataType: 'String', StringValue: alertData.riskLevel },
        },
      })
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new ExternalServiceError(`SNS 알림 발송 실패: ${err.message}`);
  }
}

/**
 * 통화 분석 결과를 DynamoDB에 저장한다.
 * ✓ c3 - DynamoDB에 분석 결과 저장
 * @param {Object} record - 저장할 통화 기록
 */
async function saveCallRecord(record) {
  try {
    await dynamodb.send(
      new PutItemCommand({
        TableName: CALL_RECORDS_TABLE,
        Item: marshall(record, { removeUndefinedValues: true }),
      })
    );
  } catch (err) {
    throw new DatabaseError(`DynamoDB 통화 기록 저장 실패: ${err.message}`);
  }
}

/**
 * Lambda 핸들러: Amazon Connect Contact Flow에서 호출
 * ✓ c6 - try-catch 에러 처리 및 HTTP 상태 코드 반환
 */
exports.handler = async (event) => {
  try {
    const { contactId, recipientId, recipientName, transcribedText } = event;

    if (!contactId || !recipientId || !transcribedText) {
      throw new ValidationError('필수 파라미터(contactId, recipientId, transcribedText)가 없습니다.');
    }

    // ✓ c2 - Comprehend 감정 분석 수행
    const comprehendResult = await analyzeWithComprehend(transcribedText);

    // ✓ c2 - Bedrock으로 Transcribe 텍스트 + Comprehend 결과 전달하여 위험도 판단 (정상/주의/위험)
    const { riskLevel, reason } = await judgeRiskWithBedrock(transcribedText, comprehendResult);

    const timestamp = new Date().toISOString();
    const callRecord = {
      contactId,
      recipientId: String(recipientId),
      recipientName: recipientName || '',
      transcribedText,
      sentiment: comprehendResult.sentiment,
      sentimentScore: comprehendResult.sentimentScore,
      riskLevel,
      riskReason: reason,
      createdAt: timestamp,
      callDate: timestamp.slice(0, 10),
    };

    // ✓ c3 - DynamoDB에 통화 결과 저장
    await saveCallRecord(callRecord);

    // ✓ c3 - 위험도가 '위험' 또는 '주의'일 때 SNS 알림 발송
    if (riskLevel === '위험' || riskLevel === '주의') {
      await sendSnsAlert({ recipientId, recipientName, riskLevel, reason, contactId });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ contactId, riskLevel, reason, message: '위험도 판단 완료' }),
    };
  } catch (err) {
    // ✓ c6 - 커스텀 에러 클래스 기반 상태 코드 반환
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    console.error('[RiskJudgeLambda] Error:', err);
    return {
      statusCode,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
