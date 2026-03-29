// ✓ c1 - Scheduler Lambda: DynamoDB에서 오늘 발신 대상자 목록 조회 후 Connect StartOutboundVoiceContact 호출
'use strict';

const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { ConnectClient, StartOutboundVoiceContactCommand } = require('@aws-sdk/client-connect');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { DatabaseError, ExternalServiceError, AppError } = require('../errors/AppError');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
const connect = new ConnectClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });

const RECIPIENTS_TABLE = process.env.RECIPIENTS_TABLE || 'WelfareRecipients';
const CONNECT_INSTANCE_ID = process.env.CONNECT_INSTANCE_ID;
const CONNECT_CONTACT_FLOW_ID = process.env.CONNECT_CONTACT_FLOW_ID;
const CONNECT_SOURCE_PHONE = process.env.CONNECT_SOURCE_PHONE;

/**
 * 오늘 발신 대상자 목록을 DynamoDB에서 조회한다.
 * @returns {Promise<Array>} 대상자 목록
 */
async function fetchTodayRecipients() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: RECIPIENTS_TABLE,
        FilterExpression: 'callDate = :today OR attribute_not_exists(callDate)',
        ExpressionAttributeValues: {
          ':today': { S: today },
        },
      })
    );
    return (result.Items || []).map((item) => unmarshall(item));
  } catch (err) {
    throw new DatabaseError(`DynamoDB 대상자 조회 실패: ${err.message}`);
  }
}

/**
 * Amazon Connect를 통해 단일 대상자에게 전화를 건다.
 * @param {Object} recipient - 대상자 정보 { recipientId, phoneNumber, name }
 * @returns {Promise<string>} contactId
 */
async function startOutboundCall(recipient) {
  if (!CONNECT_INSTANCE_ID || !CONNECT_CONTACT_FLOW_ID || !CONNECT_SOURCE_PHONE) {
    throw new ExternalServiceError('Connect 환경 변수가 설정되지 않았습니다.');
  }
  try {
    const response = await connect.send(
      new StartOutboundVoiceContactCommand({
        DestinationPhoneNumber: recipient.phoneNumber,
        ContactFlowId: CONNECT_CONTACT_FLOW_ID,
        InstanceId: CONNECT_INSTANCE_ID,
        SourcePhoneNumber: CONNECT_SOURCE_PHONE,
        Attributes: {
          recipientId: String(recipient.recipientId),
          recipientName: String(recipient.name || ''),
        },
      })
    );
    return response.ContactId;
  } catch (err) {
    throw new ExternalServiceError(`Connect 발신 실패 (${recipient.recipientId}): ${err.message}`);
  }
}

/**
 * Lambda 핸들러: EventBridge 트리거로 매일 실행
 * ✓ c6 - try-catch 에러 처리 및 HTTP 상태 코드 반환
 */
exports.handler = async (event) => {
  try {
    // ✓ c1 - DynamoDB에서 오늘 발신 대상자 목록 조회
    const recipients = await fetchTodayRecipients();
    if (recipients.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: '오늘 발신 대상자가 없습니다.', count: 0 }),
      };
    }

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        // ✓ c1 - Amazon Connect StartOutboundVoiceContact API 호출
        const contactId = await startOutboundCall(recipient);
        results.push({ recipientId: recipient.recipientId, contactId, status: 'dialed' });
      } catch (err) {
        errors.push({ recipientId: recipient.recipientId, error: err.message });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '자동 발신 완료',
        dialed: results.length,
        failed: errors.length,
        results,
        errors,
      }),
    };
  } catch (err) {
    // ✓ c6 - 커스텀 에러 클래스 기반 상태 코드 반환
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    console.error('[SchedulerLambda] Error:', err);
    return {
      statusCode,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
