# Testing Patterns

**Analysis Date:** 2026-04-15

## Test Framework

**Runner:**
- Jest 27+ (detected in package-lock.json)
- Config: No explicit `jest.config.js` file; relies on defaults
- CommonJS module system (backend) and ES modules (frontend)

**Assertion Library:**
- Jest built-in assertions: `expect()`

**Run Commands:**
```bash
npm test                    # Run all tests (backend only - frontend has no test setup)
npm run test -- --watch     # Watch mode (backend)
npm run test -- --coverage  # Coverage report (backend)
```

**Test Execution Notes:**
- Frontend: No test framework configured (only development/build scripts)
- Backend: Jest configured for CommonJS (`package.json` type: "commonjs")

## Test File Organization

**Location:**
- Backend: `/backend/tests/` directory
- Tests co-located separately from source files

**Naming:**
- Pattern: `{module-or-function}.test.js`
- Examples: `AppError.test.js`, `dashboardLambda.test.js`, `riskJudgeLambda.test.js`, `schedulerLambda.test.js`

**Structure:**
```
backend/
├── errors/
│   └── AppError.js
├── dashboardLambda/
│   └── index.js
├── tests/
│   ├── AppError.test.js
│   ├── dashboardLambda.test.js
│   ├── riskJudgeLambda.test.js
│   └── schedulerLambda.test.js
```

## Test Structure

**Suite Organization:**
```javascript
describe('module name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('specific feature/function', () => {
    test('should do X when Y condition', () => {
      // arrange
      mockFunction.mockResolvedValueOnce(value);
      
      // act
      const result = await handler(input);
      
      // assert
      expect(result).toEqual(expected);
    });
  });
});
```

**Example from `dashboardLambda.test.js` (lines 35-63):**
```javascript
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
  });
});
```

**Patterns:**
- **Setup:** `beforeEach(() => jest.clearAllMocks())` clears mocks between tests
- **Teardown:** None explicit (reliant on Jest cleanup)
- **Assertion:** Direct `expect()` calls on return values or mock calls

## Mocking

**Framework:** Jest `jest.mock()` and `jest.fn()`

**Patterns:**
AWS SDK mocking approach (`riskJudgeLambda.test.js` lines 3-25):
```javascript
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-comprehend');
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-sns');
jest.mock('@aws-sdk/util-dynamodb');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const mockDynamoSend = jest.fn();
DynamoDBClient.mockImplementation(() => ({ send: mockDynamoSend }));
```

Helper functions for test data (`dashboardLambda.test.js` lines 21-33):
```javascript
// API Gateway 이벤트 헬퍼
function makeEvent(method, path, pathParameters = {}) {
  return { httpMethod: method, path, pathParameters };
}

// DynamoDB Item 헬퍼 (marshall format)
function makeItem(obj) {
  const item = {};
  for (const [k, v] of Object.entries(obj)) {
    item[k] = { S: String(v) };
  }
  return item;
}
```

Mock response builders (`riskJudgeLambda.test.js` lines 30-36):
```javascript
function makeBedrockResponse(riskLevel, reason = '테스트 근거') {
  const text = JSON.stringify({ riskLevel, reason });
  const responseBody = { content: [{ text }] };
  const body = Buffer.from(JSON.stringify(responseBody));
  return { body };
}
```

**What to Mock:**
- AWS SDK clients: `DynamoDBClient`, `ComprehendClient`, `BedrockRuntimeClient`, `SNSClient`
- Utility functions that transform data: `marshall`, `unmarshall`
- External service dependencies (Comprehend, Bedrock, SNS, Connect)

**What NOT to Mock:**
- Custom error classes (`AppError`, `NotFoundError`, etc.)
- Business logic functions (`judgeRiskWithBedrock`, `analyzeWithComprehend`)
- Data transformation helpers (`makeEvent`, `makeItem`, `makeBedrockResponse`)

## Fixtures and Factories

**Test Data:**
Mock data factories used for creating test events and items:

From `dashboardLambda.test.js`:
```javascript
const baseEvent = {
  httpMethod: 'GET',
  path: '/recipients',
  pathParameters: {},
};

// Usage:
const result = await handler(makeEvent('GET', '/recipients'));
```

From `riskJudgeLambda.test.js` (lines 49-54):
```javascript
const baseEvent = {
  contactId: 'c-001',
  recipientId: 'r-001',
  recipientName: '홍길동',
  transcribedText: '요즘 너무 힘들고 아무것도 하기 싶어요.',
};

// Usage with variations:
const result = await handler({ ...baseEvent, transcribedText: '오늘 날씨 좋네요. 잘 지내고 있어요.' });
```

**Location:**
- Inline helper functions within test files (not in separate fixture files)
- Factories defined at module level before test suites

## Coverage

**Requirements:** Not enforced (no configuration detected)

**View Coverage:**
```bash
npm test -- --coverage
```

**Current State:** No coverage metrics enforced or reported in config

## Test Types

**Unit Tests:**
- Scope: Individual function/module behavior
- Approach: Mock all external dependencies (AWS SDK)
- Examples: 
  - `AppError.test.js` - Tests custom error class instantiation and inheritance
  - Individual `describe()` blocks for endpoint handlers

**Integration Tests:**
- Scope: Multi-function workflows (e.g., Comprehend → Bedrock → SNS → DynamoDB)
- Approach: Mock AWS SDK but test full handler flow
- Examples:
  - `riskJudgeLambda.test.js` - Tests complete risk judgment flow with all external services mocked
  - `dashboardLambda.test.js` - Tests endpoint routing and DynamoDB pagination

**E2E Tests:**
- Status: Not implemented
- Frontend has no test framework configured
- No end-to-end test suite exists

## Common Patterns

**Async Testing:**
```javascript
test('위험도 정상 → SNS 미발송, DynamoDB 저장', async () => {
  mockComprehendSend.mockResolvedValueOnce(comprehendOk);
  mockBedrockSend.mockResolvedValueOnce(makeBedrockResponse('정상'));
  mockDynamoSend.mockResolvedValueOnce({});

  const result = await handler({ ...baseEvent, transcribedText: '오늘 날씨 좋네요. 잘 지내고 있어요.' });
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(200);
  expect(body.riskLevel).toBe('정상');
});
```

**Error Testing:**
```javascript
test('필수 파라미터 누락 시 400 에러 반환', async () => {
  const result = await handler({ contactId: 'c-001', recipientId: 'r-001' }); // transcribedText 없음
  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body).error).toContain('필수 파라미터');
});

test('DynamoDB 실패 시 503을 반환한다', async () => {
  mockSend.mockRejectedValueOnce(new Error('연결 실패'));
  const result = await handler(makeEvent('GET', '/recipients'));
  expect(result.statusCode).toBe(503);
});
```

**Pagination Testing:**
Pattern: Mock first response with `LastEvaluatedKey`, second without (lines 125-148 in `dashboardLambda.test.js`):
```javascript
test('GET /calls/today - LastEvaluatedKey 있을 때 두 번째 호출로 나머지 데이터를 가져온다', async () => {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  mockSend
    .mockResolvedValueOnce({
      Items: [makeItem({ contactId: 'c1', riskLevel: '정상', callDate: today })],
      LastEvaluatedKey: { contactId: { S: 'c1' }, callDate: { S: today } },
    })
    .mockResolvedValueOnce({
      Items: [makeItem({ contactId: 'c2', riskLevel: '위험', callDate: today })],
    });

  const result = await handler(makeEvent('GET', '/calls/today'));
  const body = JSON.parse(result.body);

  expect(body.total).toBe(2);
  expect(mockSend).toHaveBeenCalledTimes(2); // Verify loop completed
});
```

**Mock Verification:**
- Call count verification: `expect(mockSend).toHaveBeenCalledTimes(2)`
- SNS isolation testing: `expect(mockSnsSend).not.toHaveBeenCalled()` for non-alert risk levels
- Call arguments: `expect(mockFunction).toHaveBeenCalledWith(expectedArg)`

## Test Coverage Status

**Tested Components:**
- `backend/errors/AppError.js` - Full coverage (all error classes)
- `backend/dashboardLambda/index.js` - Full coverage (all endpoints + pagination + errors)
- `backend/riskJudgeLambda/index.js` - Full coverage (all risk levels + SNS + retries)
- `backend/schedulerLambda/index.js` - Tests exist but not reviewed

**Untested Components:**
- Frontend React components: No test framework configured
- Mock data: Not tested (assumption data is valid)
- Frontend utilities (`sort.js`): No tests
- Integration between frontend and backend: No tests

---

*Testing analysis: 2026-04-15*
