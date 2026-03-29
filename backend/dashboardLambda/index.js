// ✓ c4 - API Gateway + Lambda 대시보드 API: 대상자 목록, 오늘의 통화 현황, 위험군 목록 엔드포인트
'use strict';

const { DynamoDBClient, ScanCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { DatabaseError, NotFoundError, ValidationError, AppError } = require('../errors/AppError');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });

const RECIPIENTS_TABLE = process.env.RECIPIENTS_TABLE || 'WelfareRecipients';
const CALL_RECORDS_TABLE = process.env.CALL_RECORDS_TABLE || 'WelfareCallRecords';

/**
 * 대상자 전체 목록을 DynamoDB에서 조회한다.
 * ✓ c4 - 대상자 목록 엔드포인트
 * @returns {Promise<Array>}
 */
async function getRecipientList() {
  try {
    const result = await dynamodb.send(new ScanCommand({ TableName: RECIPIENTS_TABLE }));
    return (result.Items || []).map((item) => unmarshall(item));
  } catch (err) {
    throw new DatabaseError(`대상자 목록 조회 실패: ${err.message}`);
  }
}

/**
 * 오늘의 통화 현황을 DynamoDB에서 조회한다.
 * ✓ c4 - 오늘의 통화 현황 엔드포인트
 * @returns {Promise<Object>} { total, completed, riskCounts }
 */
async function getTodayCallStatus() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: CALL_RECORDS_TABLE,
        FilterExpression: 'callDate = :today',
        ExpressionAttributeValues: { ':today': { S: today } },
      })
    );
    const records = (result.Items || []).map((item) => unmarshall(item));
    const riskCounts = { 정상: 0, 주의: 0, 위험: 0 };
    for (const r of records) {
      if (r.riskLevel && riskCounts[r.riskLevel] !== undefined) {
        riskCounts[r.riskLevel]++;
      }
    }
    return {
      date: today,
      total: records.length,
      riskCounts,
      records,
    };
  } catch (err) {
    throw new DatabaseError(`오늘의 통화 현황 조회 실패: ${err.message}`);
  }
}

/**
 * 위험군(위험 또는 주의) 목록을 DynamoDB에서 조회한다.
 * ✓ c4 - 위험군 목록 엔드포인트
 * @returns {Promise<Array>}
 */
async function getAtRiskList() {
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: CALL_RECORDS_TABLE,
        FilterExpression: 'riskLevel = :danger OR riskLevel = :caution',
        ExpressionAttributeValues: {
          ':danger': { S: '위험' },
          ':caution': { S: '주의' },
        },
      })
    );
    return (result.Items || []).map((item) => unmarshall(item));
  } catch (err) {
    throw new DatabaseError(`위험군 목록 조회 실패: ${err.message}`);
  }
}

/**
 * 특정 대상자의 통화 이력을 조회한다.
 * @param {string} recipientId
 * @returns {Promise<Array>}
 */
async function getCallHistory(recipientId) {
  if (!recipientId) throw new ValidationError('recipientId가 필요합니다.');
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: CALL_RECORDS_TABLE,
        FilterExpression: 'recipientId = :rid',
        ExpressionAttributeValues: { ':rid': { S: String(recipientId) } },
      })
    );
    return (result.Items || [])
      .map((item) => unmarshall(item))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    throw new DatabaseError(`통화 이력 조회 실패: ${err.message}`);
  }
}

/**
 * CORS 허용 헤더를 포함한 응답을 생성한다.
 * @param {number} statusCode
 * @param {any} body
 */
function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Lambda 핸들러: API Gateway로부터 라우팅
 * ✓ c4 - GET /recipients, GET /calls/today, GET /calls/at-risk, GET /calls/history/{recipientId}
 * ✓ c6 - try-catch 에러 처리 및 HTTP 상태 코드 반환
 */
exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  const path = event.path || event.rawPath || '/';
  const pathParams = event.pathParameters || {};

  // CORS preflight
  if (method === 'OPTIONS') {
    return buildResponse(200, {});
  }

  try {
    // ✓ c4 - 대상자 목록 엔드포인트
    if (method === 'GET' && path === '/recipients') {
      const recipients = await getRecipientList();
      return buildResponse(200, { recipients });
    }

    // ✓ c4 - 오늘의 통화 현황 엔드포인트
    if (method === 'GET' && path === '/calls/today') {
      const status = await getTodayCallStatus();
      return buildResponse(200, status);
    }

    // ✓ c4 - 위험군 목록 엔드포인트
    if (method === 'GET' && path === '/calls/at-risk') {
      const atRisk = await getAtRiskList();
      return buildResponse(200, { atRisk });
    }

    // 통화 이력 조회 엔드포인트
    if (method === 'GET' && (path.startsWith('/calls/history/') || pathParams.recipientId)) {
      const recipientId = pathParams.recipientId || path.split('/calls/history/')[1];
      const history = await getCallHistory(recipientId);
      return buildResponse(200, { recipientId, history });
    }

    throw new NotFoundError(`엔드포인트를 찾을 수 없습니다: ${method} ${path}`);
  } catch (err) {
    // ✓ c6 - 커스텀 에러 클래스 기반 상태 코드 반환
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    console.error('[DashboardLambda] Error:', err);
    return buildResponse(statusCode, { error: err.message });
  }
};
