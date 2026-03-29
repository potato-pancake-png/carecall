'use strict';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/util-dynamodb');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const mockSend = jest.fn();
DynamoDBClient.mockImplementation(() => ({ send: mockSend }));
unmarshall.mockImplementation((item) => {
  const result = {};
  for (const [k, v] of Object.entries(item)) {
    result[k] = Object.values(v)[0];
  }
  return result;
});

const { handler } = require('../dashboardLambda/index');

// API Gateway 이벤트 헬퍼
function makeEvent(method, path, pathParameters = {}) {
  return { httpMethod: method, path, pathParameters };
}

// DynamoDB Item 헬퍼
function makeItem(obj) {
  const item = {};
  for (const [k, v] of Object.entries(obj)) {
    item[k] = { S: String(v) };
  }
  return item;
}

describe('dashboardLambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /recipients', () => {
    test('대상자 목록을 반환한다', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          makeItem({ recipientId: 'r1', name: '홍길동', phoneNumber: '+82101111111' }),
          makeItem({ recipientId: 'r2', name: '김영희', phoneNumber: '+82102222222' }),
        ],
      });

      const result = await handler(makeEvent('GET', '/recipients'));
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.recipients).toHaveLength(2);
      expect(body.recipients[0].name).toBe('홍길동');
    });

    test('대상자가 없으면 빈 배열을 반환한다', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await handler(makeEvent('GET', '/recipients'));
      expect(JSON.parse(result.body).recipients).toEqual([]);
    });
  });

  describe('GET /calls/today', () => {
    test('오늘의 통화 현황과 위험도 집계를 반환한다', async () => {
      const today = new Date().toISOString().slice(0, 10);
      mockSend.mockResolvedValueOnce({
        Items: [
          makeItem({ contactId: 'c1', riskLevel: '정상', callDate: today }),
          makeItem({ contactId: 'c2', riskLevel: '주의', callDate: today }),
          makeItem({ contactId: 'c3', riskLevel: '위험', callDate: today }),
        ],
      });

      const result = await handler(makeEvent('GET', '/calls/today'));
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.total).toBe(3);
      expect(body.riskCounts['정상']).toBe(1);
      expect(body.riskCounts['주의']).toBe(1);
      expect(body.riskCounts['위험']).toBe(1);
    });
  });

  describe('GET /calls/at-risk', () => {
    test('위험군(위험+주의) 목록만 반환한다', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          makeItem({ contactId: 'c2', riskLevel: '주의', recipientId: 'r2' }),
          makeItem({ contactId: 'c3', riskLevel: '위험', recipientId: 'r3' }),
        ],
      });

      const result = await handler(makeEvent('GET', '/calls/at-risk'));
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.atRisk).toHaveLength(2);
    });
  });

  describe('GET /calls/history/:recipientId', () => {
    test('특정 대상자의 통화 이력을 반환한다', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          makeItem({ contactId: 'c1', recipientId: 'r1', createdAt: '2026-03-29T10:00:00Z', riskLevel: '정상' }),
          makeItem({ contactId: 'c2', recipientId: 'r1', createdAt: '2026-03-28T10:00:00Z', riskLevel: '주의' }),
        ],
      });

      const result = await handler(makeEvent('GET', '/calls/history/r1', { recipientId: 'r1' }));
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.history).toHaveLength(2);
      // 최신순 정렬 확인
      expect(body.history[0].createdAt > body.history[1].createdAt).toBe(true);
    });
  });

  describe('에러 처리', () => {
    test('알 수 없는 경로는 404를 반환한다', async () => {
      const result = await handler(makeEvent('GET', '/unknown/path'));
      expect(result.statusCode).toBe(404);
    });

    test('DynamoDB 실패 시 503을 반환한다', async () => {
      mockSend.mockRejectedValueOnce(new Error('연결 실패'));
      const result = await handler(makeEvent('GET', '/recipients'));
      // ✓ c5 - DatabaseError catch 시 HTTP 503 반환 검증
      expect(result.statusCode).toBe(503);
    });

    test('CORS 헤더가 모든 응답에 포함된다', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });
      const result = await handler(makeEvent('GET', '/recipients'));
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('OPTIONS preflight 요청은 200을 반환한다', async () => {
      const result = await handler(makeEvent('OPTIONS', '/recipients'));
      expect(result.statusCode).toBe(200);
    });
  });
});
