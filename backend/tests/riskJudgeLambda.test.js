'use strict';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-comprehend');
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-sns');
jest.mock('@aws-sdk/util-dynamodb');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { ComprehendClient } = require('@aws-sdk/client-comprehend');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const { SNSClient } = require('@aws-sdk/client-sns');
const { marshall } = require('@aws-sdk/util-dynamodb');

const mockDynamoSend = jest.fn();
const mockComprehendSend = jest.fn();
const mockBedrockSend = jest.fn();
const mockSnsSend = jest.fn();

DynamoDBClient.mockImplementation(() => ({ send: mockDynamoSend }));
ComprehendClient.mockImplementation(() => ({ send: mockComprehendSend }));
BedrockRuntimeClient.mockImplementation(() => ({ send: mockBedrockSend }));
SNSClient.mockImplementation(() => ({ send: mockSnsSend }));
marshall.mockImplementation((obj) => obj);

process.env.SNS_ALERT_TOPIC_ARN = 'arn:aws:sns:ap-northeast-2:123456789:WelfareAlert';

const { handler } = require('../riskJudgeLambda/index');

// Bedrock 응답 헬퍼
function makeBedrockResponse(riskLevel, reason = '테스트 근거') {
  const text = JSON.stringify({ riskLevel, reason });
  const responseBody = { content: [{ text }] };
  const body = Buffer.from(JSON.stringify(responseBody));
  return { body };
}

// Comprehend 응답 헬퍼
const comprehendOk = {
  Sentiment: 'NEGATIVE',
  SentimentScore: { Positive: 0.05, Negative: 0.8, Neutral: 0.1, Mixed: 0.05 },
};

describe('riskJudgeLambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseEvent = {
    contactId: 'c-001',
    recipientId: 'r-001',
    recipientName: '홍길동',
    transcribedText: '요즘 너무 힘들고 아무것도 하기 싫어요.',
  };

  test('정상 케이스: 위험도 정상 → SNS 미발송, DynamoDB 저장', async () => {
    mockComprehendSend.mockResolvedValueOnce(comprehendOk);
    mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('정상'));
    mockDynamoSend.mockResolvedValueOnce({});

    const result = await handler({ ...baseEvent, transcribedText: '오늘 날씨 좋네요. 잘 지내고 있어요.' });
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.riskLevel).toBe('정상');
    expect(mockSnsSend).not.toHaveBeenCalled();
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  test('위험 케이스: 위험도 위험 → SNS 발송 + DynamoDB 저장', async () => {
    mockComprehendSend.mockResolvedValueOnce(comprehendOk);
    mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('위험', '심한 우울 표현 감지'));
    mockDynamoSend.mockResolvedValueOnce({});
    mockSnsSend.mockResolvedValueOnce({});

    const result = await handler(baseEvent);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.riskLevel).toBe('위험');
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  test('주의 케이스: 위험도 주의 → SNS 발송 + DynamoDB 저장', async () => {
    mockComprehendSend.mockResolvedValueOnce(comprehendOk);
    mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('주의', '가벼운 불편 호소'));
    mockDynamoSend.mockResolvedValueOnce({});
    mockSnsSend.mockResolvedValueOnce({});

    const result = await handler(baseEvent);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.riskLevel).toBe('주의');
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
  });

  test('필수 파라미터 누락 시 400 에러 반환', async () => {
    const result = await handler({ contactId: 'c-001', recipientId: 'r-001' }); // transcribedText 없음
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toMatch('필수 파라미터');
  });

  test('Comprehend 실패 시 502 에러 반환', async () => {
    mockComprehendSend.mockRejectedValueOnce(new Error('Comprehend 연결 오류'));

    const result = await handler(baseEvent);
    expect(result.statusCode).toBe(502);
  });

  test('Bedrock이 잘못된 riskLevel 반환 시 502 에러 반환', async () => {
    mockComprehendSend.mockResolvedValueOnce(comprehendOk);
    mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('알수없음')); // 유효하지 않은 값

    const result = await handler(baseEvent);
    expect(result.statusCode).toBe(502);
  });

  test('DynamoDB 저장 실패 시 503 에러 반환', async () => {
    mockComprehendSend.mockResolvedValueOnce(comprehendOk);
    mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('정상'));
    mockDynamoSend.mockRejectedValueOnce(new Error('DynamoDB 저장 실패'));

    const result = await handler(baseEvent);
    // ✓ c5 - DatabaseError catch 시 HTTP 503 반환 검증
    expect(result.statusCode).toBe(503);
  });
});
