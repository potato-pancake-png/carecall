# Codebase Concerns

**Analysis Date:** 2026-04-15

## Tech Debt

**Frontend: Large monolithic component files**
- Issue: `RecipientList.jsx` (315 lines) and `CallTimeline.jsx` (202 lines) contain tightly coupled UI logic and state management that should be split into smaller components
- Files: `frontend/src/components/RecipientList.jsx`, `frontend/src/components/CallTimeline.jsx`
- Impact: Difficult to test individual features, high maintenance cost when modifying UI, potential for regression in related features
- Fix approach: Extract sub-components (RecipientModal, SentimentChart, ChatView) into separate files and create custom hooks for state management patterns

**Frontend: Mock data in production paths**
- Issue: Mock data loaded from `mockData.js` and `adminMockData.js` is used directly in App.jsx without environment-based conditional logic
- Files: `frontend/src/App.jsx` (lines 8-9), `frontend/src/mockData.js`, `frontend/src/components/admin/adminMockData.js`
- Impact: Risk of shipping test data to production; no distinction between dev/test/prod environments
- Fix approach: Create environment-based data loader that conditionally imports mock data only in development, use API in production

**Backend: No external call retry for SNS**
- Issue: SNS alert sending is wrapped in try-catch with error logging but failures don't retry. If SNS is temporarily unavailable, critical alerts are silently dropped
- Files: `backend/riskJudgeLambda/index.js` (lines 235-242)
- Impact: Welfare workers may not receive urgent risk alerts about vulnerable seniors, delaying emergency response
- Fix approach: Implement retry logic with exponential backoff for SNS failures, or use Lambda DLQ to queue failed alerts

**Frontend: Inline CSS everywhere**
- Issue: All components use inline style objects passed to JSX elements. Over 1000+ inline style declarations across components
- Files: All frontend components (`RecipientList.jsx`, `CallTimeline.jsx`, `RiskStatusPanel.jsx`, `App.jsx`, etc.)
- Impact: Impossible to maintain visual consistency, difficult to refactor design system, no separation of concerns between styling and logic, prevents dark mode or theme switching
- Fix approach: Move all inline styles to CSS modules or Tailwind classes, create shared style constants object, use CSS variables for colors consistently

**Backend: Hardcoded environment variable defaults**
- Issue: All Lambda functions provide fallback values for required environment variables (e.g., `process.env.AWS_REGION || 'ap-northeast-2'`)
- Files: `backend/riskJudgeLambda/index.js` (line 19), `backend/dashboardLambda/index.js` (line 10), `backend/schedulerLambda/index.js` (line 9)
- Impact: Masks misconfiguration in staging/production - wrong region could silently use ap-northeast-2 instead of failing fast
- Fix approach: Remove all fallback defaults, require explicit environment variables, fail at Lambda cold start if missing

## Known Bugs

**Frontend: Avatar rendering error with missing photo**
- Symptoms: If recipient.photo is null and getAvatarLabel() returns empty string, avatar displays empty circle
- Files: `frontend/src/components/RecipientList.jsx` (line 80)
- Trigger: Create recipient without uploading photo, or edit recipient and clear photo
- Workaround: Avatar still renders but shows no visual indicator; does not break functionality

**Backend: DynamoDB QueryCommand may not return all items if pagination exceeds request size**
- Symptoms: If callDate-index has >1MB of results, subsequent pagination requests may fail with undefined LastEvaluatedKey
- Files: `backend/dashboardLambda/index.js` (lines 51-67, 99-118), `backend/schedulerLambda/index.js` (lines 24-35)
- Trigger: System processes >1000 calls per day, causing pagination to split across API calls
- Workaround: Query pagination handles this but doesn't catch all edge cases; could silently truncate results if excluded error handling

**Frontend: RecipientModal doesn't validate phone number format**
- Symptoms: User can save recipient with invalid phone number (empty string, special characters) - no client-side validation beyond non-empty check
- Files: `frontend/src/components/RecipientList.jsx` (line 186, 254)
- Trigger: User enters non-numeric characters in phone number field during add/edit
- Workaround: No validation; relies on user input accuracy

## Security Considerations

**Frontend: No authentication/authorization implementation**
- Risk: LoginScreen accepts any email/password without validation; onLogin handler just sets isAuthenticated=true without verifying credentials. Anyone can access dashboard by typing in browser console
- Files: `frontend/src/App.jsx` (lines 24-64, line 119)
- Current mitigation: None
- Recommendations: Implement JWT-based authentication with backend; validate credentials against database or auth service; store tokens securely in httpOnly cookies not localStorage; add role-based access control

**Frontend: Sensitive data exposed in mock data**
- Risk: Mock data includes full recipient names, phone numbers, addresses, ages, health notes in frontend source code; could be extracted from minified bundles
- Files: `frontend/src/mockData.js` (lines 10-17), `frontend/src/components/admin/adminMockData.js`
- Current mitigation: Data is mock only, but patterns encourage real PII in source
- Recommendations: Use generic names/numbers in mock data; never commit real PII to repository; implement proper data masking in UI (show only last 4 digits of phone)

**Backend: No input validation on transcribedText parameter**
- Risk: RiskJudgeLambda sends user-provided transcribedText directly to Bedrock without sanitization; could enable prompt injection attacks
- Files: `backend/riskJudgeLambda/index.js` (line 54)
- Current mitigation: Bedrock prompt uses template literals which mitigates some risk, but no explicit input filtering
- Recommendations: Validate transcribedText length <5000 chars; sanitize/escape special characters; use parameterized prompts; add input validation at API Gateway layer

**Frontend: CORS header allows all origins**
- Risk: API responses include `Access-Control-Allow-Origin: *` which allows any website to access call records and recipient data
- Files: `backend/dashboardLambda/index.js` (line 165)
- Current mitigation: Backend data is mock only in current state, but pattern enables cross-origin attacks
- Recommendations: Replace `*` with specific domain whitelist; use explicit allowed origins based on deployment environment; implement CSRF tokens for state-changing operations

**Backend: Error messages leak internal system details**
- Risk: API error responses return detailed error messages that could reveal AWS service names, table names, environment configuration
- Files: `backend/riskJudgeLambda/index.js` (line 187), `backend/dashboardLambda/index.js` (line 215)
- Current mitigation: Errors use generic text ("외부 서비스 오류"), but database names visible in stack traces
- Recommendations: Generic error messages in API responses; log full details server-side only; never expose stack traces to client

## Performance Bottlenecks

**Frontend: Entire recipient list re-renders on every keystroke**
- Problem: SearchQuery state change in App.jsx triggers full RecipientList re-render, even though only filtered array changes
- Files: `frontend/src/App.jsx` (lines 114, 134-138), `frontend/src/components/RecipientList.jsx` (lines 18-23)
- Cause: No memoization of RecipientList component; sortedRecipients computed inline on every render
- Improvement path: Wrap RecipientList in React.memo(); move sortedRecipients computation to useMemo hook; debounce search input

**Backend: ScanCommand used in getRecipientList pagination**
- Problem: Full table scan with pagination instead of GSI query; O(n) complexity for every dashboard load
- Files: `backend/dashboardLambda/index.js` (line 30)
- Cause: No partition key used; WelfareRecipients table design may lack appropriate GSI for this access pattern
- Improvement path: Add createdAt or status GSI; use QueryCommand instead of ScanCommand; implement DynamoDB pagination with limits; cache results with TTL

**Frontend: sentiment score SVG chart re-renders unnecessarily**
- Problem: SentimentLineChart component recalculates all path coordinates on every parent render
- Files: `frontend/src/components/CallTimeline.jsx` (lines 18-76)
- Cause: No memoization; inline function definitions (getX, getY) recreated every render
- Improvement path: Wrap component in React.memo(); extract getX/getY as constants; use useMemo for points array

## Fragile Areas

**Frontend: RecipientModal form state management**
- Files: `frontend/src/components/RecipientList.jsx` (lines 178-204)
- Why fragile: Form state stored in local useState, lost if modal closes during edit; photo conversion to base64 can be problematic for large images; validation only checks non-empty, no type checking
- Safe modification: Add form validation utility function; implement file size limits before base64 conversion; use FormData or multipart upload for large files; add unsaved changes warning
- Test coverage: No tests for form validation, photo upload, or modal state transitions

**Backend: Bedrock retry logic with regex JSON parsing**
- Files: `backend/riskJudgeLambda/index.js` (lines 49-120)
- Why fragile: JSON response from Bedrock is parsed using regex `/{[\s\S]*}/` which could match incomplete or nested JSON; if response has multiple JSON-like strings, first match wins; no schema validation after parsing
- Safe modification: Use strict JSON parsing with try-catch; validate response shape before returning; add timeout to prevent infinite retries; log full Bedrock response for debugging
- Test coverage: Only happy path tested; no tests for malformed responses, timeout scenarios, or retry exhaustion

**Frontend: Date/time handling with toLocaleDateString**
- Files: `frontend/src/components/CallTimeline.jsx` (line 72, 95), `frontend/src/mockData.js` (lines 3-8)
- Why fragile: Date formatting depends on browser locale; makeDate() uses setHours() which can produce different times across timezones; no daylight saving time handling
- Safe modification: Use date-fns or Day.js library; standardize all dates to ISO 8601; store timezone info with every timestamp; test across multiple timezones
- Test coverage: No tests for timezone edge cases, DST transitions, or locale-specific formatting

**Backend: DynamoDB conditional write with attribute_not_exists**
- Files: `backend/riskJudgeLambda/index.js` (line 167), `backend/schedulerLambda/index.js` (line 93)
- Why fragile: If ConditionalCheckFailedException occurs, error is caught but no explicit handling for duplicate contactId; silent failure could cause data loss
- Safe modification: Add explicit retry with exponential backoff; log duplicate detection for debugging; implement idempotency tokens in caller; add metrics for conditional check failures
- Test coverage: No tests for race conditions, concurrent writes, or duplicate insertion scenarios

## Scaling Limits

**Frontend: Mock data array grows linearly with call history**
- Current capacity: ~70 mock records visible in UI smoothly
- Limit: At 1000+ records, RecipientList table rendering slows noticeably; scroll performance degrades
- Scaling path: Implement virtualization (react-window); add server-side pagination with cursor-based loading; implement lazy loading for historical data; add client-side indexing

**Backend: DynamoDB on-demand pricing without projection**
- Current capacity: Handles 6 recipients × 3+ calls/day = 18+ writes/day
- Limit: At 1000+ recipients with multiple daily calls, read/write costs scale linearly without cap; QueryCommand returns full item even if only count needed
- Scaling path: Use ProjectionExpression to fetch only needed attributes; implement ElastiCache layer for dashboard queries; switch to provisioned throughput with auto-scaling; implement result caching with TTL

**Backend: SNS alert dispatch is synchronous**
- Current capacity: 1 alert per Lambda invocation (serial), no batching
- Limit: At 100+ simultaneous high-risk alerts, SNS becomes bottleneck; Lambda duration increases, timeout risk rises
- Scaling path: Implement SQS queue for alert buffering; use EventBridge for fanout; batch SNS publishes with MessageBatch API; separate alert dispatch into async workflow

## Dependencies at Risk

**AWS SDK versions with caret ranges**
- Risk: Package.json specifies `@aws-sdk/client-* "^3.0.0"` which allows minor/patch upgrades automatically; SDK v3 has breaking changes across minor versions
- Impact: Automatic npm updates could break Lambda functions with undiscovered incompatibilities
- Migration plan: Pin exact versions (e.g., `3.600.0`) in package.json; test SDK updates in staging before deploying to production; monitor AWS SDK release notes

**Missing dependencies for frontend utilities**
- Risk: No date library (date-fns, Day.js) or validation library (zod, joi); project relies on native Date API and manual string checks
- Impact: Date handling is error-prone; complex form validation duplicated across components
- Migration plan: Add date-fns for consistent date operations; add zod for runtime validation; update package.json with these dependencies; refactor date/validation logic

## Missing Critical Features

**No API authentication layer**
- Problem: Backend Lambda functions lack AWS_IAM or API key validation; any HTTP request with correct path succeeds
- Blocks: Cannot implement multi-tenant support; cannot audit which admin accessed what data; cannot revoke access
- Recommendations: Add AWS IAM authentication to API Gateway; implement API keys per admin account; add request signing; log all API access for audit trail

**No audit logging**
- Problem: No record of when recipients were added/modified, who changed risk levels, which admin viewed sensitive data
- Blocks: Cannot investigate data breaches; cannot comply with regulatory requirements for vulnerable population; cannot trace state changes
- Recommendations: Add CloudWatch logging to all Lambda functions with operation type (create/update/read), user ID, timestamp, and data affected; implement retention policy; add audit dashboard

**No real-time alert notifications**
- Problem: SNS alerts are fire-and-forget; no confirmation that welfare worker received alert; no escalation if alert is ignored
- Blocks: Cannot ensure urgent cases receive immediate attention; no follow-up mechanism if on-call worker doesn't respond
- Recommendations: Implement WebSocket connections for real-time dashboard updates; add alert acknowledgment flow; implement escalation rules (notify supervisor if not acknowledged in 15min)

**No data persistence strategy**
- Problem: Frontend uses mock data; no backend data storage integration; no way to save recipient changes to real database
- Blocks: All edits to recipients are lost on page refresh; no persistent audit trail; no multi-user consistency
- Recommendations: Connect frontend API calls to actual DynamoDB tables; implement optimistic updates with conflict resolution; add real-time sync using DynamoDB Streams

## Test Coverage Gaps

**Frontend: No unit tests for components**
- What's not tested: RecipientList rendering, sorting logic, modal form validation, error states, accessibility
- Files: `frontend/src/components/RecipientList.jsx`, `frontend/src/components/CallTimeline.jsx`, `frontend/src/components/RiskStatusPanel.jsx`
- Risk: Regression in recipient management or sorting could break production without detection
- Priority: High - core business logic for managing elderly care targets

**Frontend: No tests for API integration**
- What's not tested: Actual API calls, error handling on network failure, retry logic, timeout scenarios
- Files: `frontend/src/api/dashboardApi.js`
- Risk: Silent API failures (empty response, timeout) not handled; would show blank screens to users
- Priority: High - user experience depends on reliable API communication

**Backend: No integration tests between Lambdas**
- What's not tested: DynamoDB write from riskJudgeLambda then read by dashboardLambda; SNS message format; contact flow attributes passed to Lambda
- Files: `backend/riskJudgeLambda/index.js`, `backend/dashboardLambda/index.js`, `backend/schedulerLambda/index.js`
- Risk: Integration bugs (e.g., sentimentScore stored as string instead of number) only discovered in production
- Priority: High - end-to-end call processing workflow

**Backend: No tests for error scenarios**
- What's not tested: Network timeouts, malformed responses from Bedrock/Comprehend, DynamoDB throttling, missing environment variables
- Files: All Lambda functions
- Risk: Unhandled errors crash Lambda or return 500; no graceful degradation
- Priority: Medium - reliability of emergency alert system

**Frontend: No tests for sorting utility**
- What's not tested: sortByType function with edge cases (empty arrays, null values, undefined comparators)
- Files: `frontend/src/utils/sort.js`
- Risk: Sorting fails silently on edge cases; recipients displayed in wrong order during crisis
- Priority: Medium - affects information clarity in UI

---

*Concerns audit: 2026-04-15*
