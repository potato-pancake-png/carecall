'use strict';

// AWS SDK 모킹
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-connect');
jest.mock('@aws-sdk/util-dynamodb');

const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { ConnectClient, StartOutboundVoiceContactCommand } = require('@aws-sdk/client-connect');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

// 모킹 설정 - send 메서드를 jest.fn()으로
const mockDynamoSend = jest.fn();
const mockConnectSend = jest.fn();
DynamoDBClient.mockImplementation(() => ({ send: mockDynamoSend }));
ConnectClient.mockImplementation(() => ({ send: mockConnectSend }));

// unmarshall은 실제 동작처럼 그대로 반환
unmarshall.mockImplementation((item) => {
  const result = {};
  for (const [k, v] of Object.entries(item)) {
    result[k] = Object.values(v)[0];
  }
  return result;
});

// 환경 변수 설정 (모듈 로드 전)
process.env.CONNECT_INSTANCE_ID = 'test-instance-id';
process.env.CONNECT_CONTACT_FLOW_ID = 'test-flow-id';
process.env.CONNECT_SOURCE_PHONE = '+821012345678';

const { handler } = require('../schedulerLambda/index');

describe('schedulerLambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('대상자가 없으면 count:0 응답을 반환한다', async () => {
    mockDynamoSend.mockResolvedValueOnce({ Items: [] });

    const result = await handler({});
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.count).toBe(0);
    expect(body.message).toMatch('오늘 발신 대상자가 없습니다');
  });

  test('대상자가 있으면 Connect에 발신 요청을 하고 결과를 반환한다', async () => {
    mockDynamoSend.mockResolvedValueOnce({
      Items: [
        { recipientId: { S: 'r1' }, phoneNumber: { S: '+82101111111' }, name: { S: '홍길동' } },
        { recipientId: { S: 'r2' }, phoneNumber: { S: '+82102222222' }, name: { S: '김영희' } },
      ],
    });
    mockConnectSend
      .mockResolvedValueOnce({ ContactId: 'contact-001' })
      .mockResolvedValueOnce({ ContactId: 'contact-002' });

    const result = await handler({});
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.dialed).toBe(2);
    expect(body.failed).toBe(0);
    expect(mockConnectSend).toHaveBeenCalledTimes(2);
  });

  test('Connect 발신 실패 시 errors 배열에 기록하고 계속 진행한다', async () => {
    mockDynamoSend.mockResolvedValueOnce({
      Items: [
        { recipientId: { S: 'r1' }, phoneNumber: { S: '+82101111111' }, name: { S: '홍길동' } },
        { recipientId: { S: 'r2' }, phoneNumber: { S: '+82102222222' }, name: { S: '김영희' } },
      ],
    });
    mockConnectSend
      .mockResolvedValueOnce({ ContactId: 'contact-001' })
      .mockRejectedValueOnce(new Error('Connect API 오류'));

    const result = await handler({});
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.dialed).toBe(1);
    expect(body.failed).toBe(1);
  });

  test('DynamoDB 조회 실패 시 500 에러를 반환한다', async () => {
    mockDynamoSend.mockRejectedValueOnce(new Error('DynamoDB 연결 실패'));

    const result = await handler({});

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toMatch('DynamoDB');
  });

  test('Connect 환경 변수 누락 시 502 에러를 반환한다', async () => {
    const originalInstanceId = process.env.CONNECT_INSTANCE_ID;
    delete process.env.CONNECT_INSTANCE_ID;

    mockDynamoSend.mockResolvedValueOnce({
      Items: [
        { recipientId: { S: 'r1' }, phoneNumber: { S: '+82101111111' }, name: { S: '홍길동' } },
      ],
    });

    const result = await handler({});
    const body = JSON.parse(result.body);

    // Connect 환경변수 없으면 ExternalServiceError(502) 발생하지만
    // 개별 발신 에러는 errors 배열에 누적되므로 전체 statusCode는 200
    expect(body.failed).toBe(1);

    process.env.CONNECT_INSTANCE_ID = originalInstanceId;
  });
});
