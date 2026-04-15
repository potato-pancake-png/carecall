# Coding Conventions

**Analysis Date:** 2026-04-15

## Naming Patterns

**Files:**
- React components: PascalCase + `.jsx` (e.g., `RecipientList.jsx`, `AdminAccountsScreen.jsx`)
- JavaScript modules: camelCase + `.js` (e.g., `mockData.js`, `sort.js`, `index.js`)
- Lambda handlers: `index.js` in lambda directories (e.g., `dashboardLambda/index.js`, `riskJudgeLambda/index.js`)
- Error classes: PascalCase + `.js` (e.g., `AppError.js`)
- Test files: Match source file name + `.test.js` (e.g., `AppError.test.js`, `dashboardLambda.test.js`)

**Functions:**
- React component functions: PascalCase (e.g., `RecipientList`, `DetailItem`, `TodayStatusCards`)
- Utility/helper functions: camelCase (e.g., `sortByType`, `makeDate`, `buildResponse`, `judgeRiskWithBedrock`)
- Private functions within modules: camelCase (e.g., `getRecipientList`, `getTodayCallStatus`)
- Event handlers: camelCase with `handle` or `on` prefix (e.g., `handleSubmit`, `onFilterChange`, `onClick`)

**Variables:**
- State variables: camelCase (e.g., `sortType`, `showAddModal`, `editingRecipient`, `selectedId`)
- Constants: UPPER_SNAKE_CASE (e.g., `RECIPIENTS_TABLE`, `BEDROCK_MODEL_ID`, `RISK_BADGE`, `RISK_CONFIG`)
- Configuration objects: PascalCase for exports, camelCase for internal (e.g., `ADMIN_STATUS_META`, `ROLE_META`)
- Boolean variables: camelCase with descriptive names (e.g., `autoCallEnabled`, `isOpen`, `isActive`, `isUrgent`)

**Types:**
- Custom error classes: PascalCase extending `Error` (e.g., `AppError`, `NotFoundError`, `ValidationError`, `DatabaseError`)
- Configuration/metadata objects: UPPER_SNAKE_CASE (e.g., `RISK_BADGE`, `DASHBOARD_TABS`, `APP_VIEWS`)

## Code Style

**Formatting:**
- No formal linter (ESLint/Prettier) detected in configuration
- Indentation: 2 spaces (consistently used across all files)
- Line length: No hard limit enforced; typical files use 80-120 character lines
- Semicolons: Present and required (not optional)
- Quotes: Single quotes preferred in JSX/JS code
- Trailing commas: Used in multiline structures

**Language Features:**
- ES6+ features actively used: arrow functions, destructuring, const/let, template literals, async/await
- JSDoc comments: Used sparingly for complex functions (e.g., in Lambda handlers)
- Comments with checkmarks: Backend uses `// ✓ cX` comments to mark implementation criteria (e.g., `// ✓ c6 - Pagination pattern`)

## Import Organization

**Order:**
1. Third-party libraries (React, AWS SDK clients)
2. Internal modules/utilities (custom error classes, utils)
3. Constants/data files (mock data, configuration)

**Example from `riskJudgeLambda/index.js`:**
```javascript
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { ComprehendClient, DetectSentimentCommand } = require('@aws-sdk/client-comprehend');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { DatabaseError, ExternalServiceError, ValidationError, AppError } = require('../errors/AppError');
```

**Path Aliases:**
- Relative imports used throughout: `../utils/sort`, `../components/RecipientList`
- No alias shortcuts configured (no `@/` patterns)

## Error Handling

**Patterns:**
- All errors inherit from custom `AppError` base class (`backend/errors/AppError.js`)
- Specific error types: `NotFoundError` (404), `ValidationError` (400), `ExternalServiceError` (502), `DatabaseError` (503)
- Always include message and statusCode: `throw new ValidationError('Required field missing')`
- Original errors logged to console only: `console.error('[Module] Description:', err)` - never exposed to API responses
- Redacted error messages for external responses: Use generic message instead of internal error details
- Try-catch wrapping: SNS alerts wrapped independently to prevent cascade failures (`riskJudgeLambda/index.js` lines 236-242)

**Example from `dashboardLambda/index.js`:**
```javascript
try {
  // operation
} catch (err) {
  console.error('[DashboardLambda] Query failed:', err); // Internal only
  throw new DatabaseError('Query failed'); // External message
}
```

## Logging

**Framework:** `console.error()` only (no logging library)

**Patterns:**
- Only errors logged explicitly: `console.error('[Module] Message:', err)`
- Format: `[LambdaName]` prefix for context identification
- Original error objects logged to stderr
- No debug/info/warn levels; only console.error used for failures

**Example:**
```javascript
console.error('[RiskJudgeLambda] Bedrock위험도 판단 실패:', err);
console.warn(`[RiskJudgeLambda] Bedrock 재시도 ${attempt}/${MAX_ATTEMPTS - 1}: ${lastError.message}`);
```

## Comments

**When to Comment:**
- Implementation details explaining AWS patterns (e.g., pagination, GSI usage)
- Business logic decisions (e.g., risk level thresholds)
- Non-obvious control flow (e.g., retry logic, error isolation)

**Checkmark Comments (Backend Only):**
Backend uses a marking system `// ✓ cX` where X is a requirement number:
- `// ✓ c1` - Core requirement (e.g., QueryCommand for GSI instead of ScanCommand)
- `// ✓ c2` - Retry logic (e.g., Bedrock retries up to 3 times)
- `// ✓ c3` - Timezone handling (e.g., KST calculation instead of UTC)
- `// ✓ c4` - Data validation/deduplication (e.g., ConditionExpression for duplicate prevention)
- `// ✓ c5` - Error handling (e.g., error logging isolation, error message redaction)
- `// ✓ c6` - Implementation correctness (e.g., pagination loop, status code mapping)
- `// ✓ c7` - API routing (e.g., path.endsWith() for stage prefix handling)

Example:
```javascript
// ✓ c6 - QueryCommand with callDate-index GSI, ExclusiveStartKey 기반 페이지네이션 루프
const result = await dynamodb.send(new QueryCommand(params));
```

**JSDoc/TSDoc:**
Minimal JSDoc usage observed only for complex Lambda handlers. Example from `dashboardLambda/index.js`:
```javascript
/**
 * 대상자 전체 목록을 DynamoDB에서 조회한다.
 * ✓ c6 - ScanCommand를 ExclusiveStartKey 기반 페이지네이션 루프로 감싸서 결과가 1MB 초과해도 전체 목록 반환
 * @returns {Promise<Array>}
 */
async function getRecipientList() {
  // ...
}
```

## Function Design

**Size:** Small, focused functions with single responsibility
- Database query functions: 15-20 lines
- Handler functions: 30-50 lines (including error handling)
- Component render: 200-300 lines (including JSX inline styles)

**Parameters:**
- Accept destructured objects for multiple parameters: `function handler({ contactId, recipientId, transcribedText }) {}`
- Use optional parameters with defaults: `new AppError(message, statusCode || 500)`
- Avoid positional parameters beyond 2-3

**Return Values:**
- Functions return Objects or Arrays, never mixed types
- Async functions return Promises: `async function() { return { data } }`
- Errors thrown, not returned

**Example from `sort.js`:**
```javascript
export function sortByType(data, sortType, getStatus, getRisk) {
  return [...data].sort((a, b) => {
    // sorting logic
    return 0; // or comparison result
  });
}
```

## Module Design

**Exports:**
- Frontend: `export default` for React components, `export const` for utilities
- Backend: `module.exports = { handler }` for Lambda handlers, `module.exports = { Class1, Class2 }` for error classes

**Example from backend:**
```javascript
module.exports = { AppError, NotFoundError, ValidationError, ExternalServiceError, DatabaseError };
```

**Barrel Files:**
Not used in this codebase. Direct imports from source files preferred:
```javascript
import RecipientList from './components/RecipientList';
// NOT: import { RecipientList } from './components';
```

## React-Specific Patterns

**State Management:**
- `useState` hooks for local component state
- Props passed down for data flow
- No global state library (Redux/Context not used)

**Inline Styling:**
- CSS variables used extensively: `color: 'var(--color-primary)', padding: 'var(--radius-lg)'`
- Inline `style` objects preferred over className for component-specific styling
- Dynamic styles computed from props: `backgroundColor: r.autoCallEnabled ? 'var(--color-success-light)' : 'var(--color-bg-subtle)'`

**Component Structure:**
- Main component functions receive props: `({ recipients, onSelect, onUpdate, onDelete, onAdd })`
- Sub-components defined within same file: `function DetailItem({ label, value }) {}`
- Modal/dialog components: Conditional rendering within parent (lines 164-173 in RecipientList.jsx)

---

*Convention analysis: 2026-04-15*
