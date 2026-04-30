# Architecture

**Analysis Date:** 2026-04-15

## Pattern Overview

**Overall:** Event-driven serverless microservices with React frontend

**Key Characteristics:**
- AWS Lambda-based backend processing pipeline triggered by EventBridge
- DynamoDB as central data store with GSI-based querying
- Separated concerns: scheduling, risk analysis, and data retrieval via distinct Lambda functions
- Frontend uses React with client-side mock data (no live API integration yet)
- Custom error hierarchy for standardized error handling across services

## Layers

**Data Access Layer:**
- Purpose: Query and store data in DynamoDB using optimized GSI indices
- Location: `backend/schedulerLambda/index.js`, `backend/riskJudgeLambda/index.js`, `backend/dashboardLambda/index.js`
- Contains: DynamoDB client calls, QueryCommand/ScanCommand with pagination, PutItemCommand for persistence
- Depends on: AWS SDK (DynamoDB, Comprehend, Bedrock, Connect, SNS)
- Used by: Lambda handlers

**Business Logic Layer:**
- Purpose: Risk assessment, alert routing, recipient scheduling
- Location: `backend/riskJudgeLambda/index.js` (risk judgment), `backend/schedulerLambda/index.js` (call scheduling)
- Contains: Risk level determination via Bedrock, sentiment analysis with Comprehend, alert logic for SNS
- Depends on: Bedrock (Claude), Comprehend, SNS, DynamoDB
- Used by: Lambda handlers

**Integration Layer:**
- Purpose: Orchestrate external AWS services (Amazon Connect, SNS, Bedrock)
- Location: All three Lambda functions
- Contains: Connect voice call initiation, SNS notifications, Bedrock AI analysis
- Depends on: AWS SDK clients
- Used by: Business logic

**API Layer:**
- Purpose: Expose dashboard data via HTTP endpoints
- Location: `backend/dashboardLambda/index.js` (handler), `frontend/src/api/dashboardApi.js` (client)
- Contains: RESTful endpoints, CORS handling, path-based routing
- Depends on: API Gateway, Lambda, DynamoDB
- Used by: Frontend React components

**Presentation Layer:**
- Purpose: Render admin dashboard UI with real-time call monitoring
- Location: `frontend/src/`
- Contains: React components (RecipientList, RiskStatusPanel, CallTimeline, admin screens), mock data
- Depends on: dashboardApi client, mockData
- Used by: End users (admin staff)

**Error Handling Layer:**
- Purpose: Standardized error classification with HTTP status codes
- Location: `backend/errors/AppError.js`
- Contains: AppError base class, ValidationError (400), NotFoundError (404), ExternalServiceError (502), DatabaseError (503)
- Depends on: None
- Used by: All Lambda functions

## Data Flow

**Call Processing Pipeline:**

1. **Scheduling** → EventBridge triggers SchedulerLambda daily at set time
2. **Recipient Lookup** → SchedulerLambda queries DynamoDB with callDate GSI to fetch today's recipients
3. **Call Initiation** → SchedulerLambda invokes Amazon Connect StartOutboundVoiceContact for each recipient
4. **Call Execution** → Amazon Connect executes contact flow with predefined script, triggers RiskJudgeLambda mid-call
5. **Voice Analysis** → Contact Flow handles Transcribe integration (text conversion)
6. **Risk Assessment** → RiskJudgeLambda receives transcribed text, calls Comprehend for sentiment, then Bedrock (Claude) for risk level judgment
7. **Alert Routing** → If riskLevel='위험' or '주의', RiskJudgeLambda sends SNS alert to welfare worker
8. **Data Persistence** → RiskJudgeLambda saves call record (including sentiment scores, risk level, reasoning) to DynamoDB
9. **Dashboard Query** → DashboardLambda fetches today's calls from callDate-index GSI, returns to frontend
10. **UI Rendering** → React components display risk status cards, at-risk list, call timeline

**State Management:**
- All state stored in DynamoDB with no in-memory caching in Lambda (stateless design)
- Frontend uses React hooks (useState) with mock data for UI state
- GSI queries enable efficient filtering by callDate and recipientId

## Key Abstractions

**Lambda Handler Pattern:**
- Purpose: Standardized entry point for event-driven Lambda execution
- Examples: `backend/schedulerLambda/index.js:handler`, `backend/riskJudgeLambda/index.js:handler`, `backend/dashboardLambda/index.js:handler`
- Pattern: Try-catch wrapping, environment variable validation at top, custom error handling, HTTP response with statusCode and JSON body

**Promise.allSettled() for Parallel Execution:**
- Purpose: Batch process multiple recipients without blocking on individual failures
- Examples: `backend/schedulerLambda/index.js:126-128` (parallel call initiation)
- Pattern: Map recipients to promises, settle all, collect fulfilled and rejected results separately

**Pagination with ExclusiveStartKey:**
- Purpose: Handle DynamoDB 1MB result limit for large datasets
- Examples: `backend/dashboardLambda/index.js:25-33` (recipient list), `backend/dashboardLambda/index.js:54-67` (today's calls)
- Pattern: Do-while loop checking LastEvaluatedKey, accumulate results until no more pages

**Retry Logic with Exponential Backoff:**
- Purpose: Handle transient failures in Bedrock calls
- Examples: `backend/riskJudgeLambda/index.js:68-120`
- Pattern: Loop up to 3 attempts, 1-second delay between retries, only retry on ExternalServiceError

**GSI-based Querying:**
- Purpose: Efficient filtering without full table scans
- Examples: callDate-index (queries by day), recipientId-index (call history lookup)
- Pattern: QueryCommand with KeyConditionExpression and optional FilterExpression for secondary filtering

**Custom Error Hierarchy:**
- Purpose: Map domain errors to appropriate HTTP status codes
- Examples: ValidationError → 400, NotFoundError → 404, DatabaseError → 503, ExternalServiceError → 502
- Pattern: Each Lambda catches errors, checks isinstance, returns statusCode from error or 500 default

## Entry Points

**SchedulerLambda:**
- Location: `backend/schedulerLambda/index.js:109`
- Triggers: EventBridge rule (scheduled daily)
- Responsibilities: Fetch today's recipients, initiate parallel calls via Connect, persist dial results to DynamoDB

**RiskJudgeLambda:**
- Location: `backend/riskJudgeLambda/index.js:183`
- Triggers: Amazon Connect Contact Flow (mid-call)
- Responsibilities: Analyze transcribed text with Comprehend + Bedrock, determine risk level, send SNS alert if needed, save call record to DynamoDB

**DashboardLambda:**
- Location: `backend/dashboardLambda/index.js:178`
- Triggers: API Gateway HTTP requests from frontend
- Responsibilities: Route requests to appropriate data fetchers (recipients, today's calls, at-risk list, call history), return JSON with CORS headers

**Frontend React App:**
- Location: `frontend/src/main.jsx:7`
- Triggers: Browser page load
- Responsibilities: Render login screen, dashboard with tabs, admin screens, manage local UI state, display mock data

## Error Handling

**Strategy:** Hierarchical custom error classes with HTTP status codes; inner errors logged to console, external messages sanitized

**Patterns:**

1. **Validation Errors (400):** Required parameters checked at handler entry, ValidationError thrown immediately
   - Example: `backend/riskJudgeLambda/index.js:192-194` (contactId, recipientId validation)

2. **External Service Errors (502):** AWS service failures (Connect, Comprehend, Bedrock, SNS)
   - Logged with full error details to console, sanitized message returned to caller
   - Example: `backend/riskJudgeLambda/index.js:104-119` (Bedrock retry logic)

3. **Database Errors (503):** DynamoDB failures
   - ConditionExpression prevents duplicate writes via attribute_not_exists checks
   - Example: `backend/riskJudgeLambda/index.js:160-176`

4. **Isolation Pattern:** SNS alert failures do not cascade
   - `backend/riskJudgeLambda/index.js:235-242`: SNS try-catch wrapped independently, error logged but ignored
   - Ensures call record is persisted even if notification fails

5. **Empty Text Handling:** If transcribedText is '', treated as risk='위험' without calling Comprehend/Bedrock
   - Example: `backend/riskJudgeLambda/index.js:200-203`

## Cross-Cutting Concerns

**Logging:** Console-based only
- Errors logged with function label prefix: `[SchedulerLambda]`, `[RiskJudgeLambda]`, `[DashboardLambda]`
- Info/warnings logged during retries
- Original error details logged, sanitized messages exposed externally

**Validation:** Multi-level
- Handler: Required env vars checked (process.env.CONNECT_INSTANCE_ID, SNS_ALERT_TOPIC_ARN, etc.)
- Function: Required parameters validated (recipientId, contactId, transcribedText)
- Data: Bedrock response JSON validated against expected riskLevel values
- Example: `backend/riskJudgeLambda/index.js:99-101` (riskLevel validation)

**Authentication:** Amazon Cognito (결정됨)
- Cognito User Pool: 관리자 로그인 및 JWT 토큰 발급 (orgId 클레임 포함)
- API Gateway Cognito Authorizer: 모든 API 요청에서 JWT 자동 검증
- Lambda: 토큰에서 orgId 추출 → DynamoDB 기관별 데이터 격리
- 현재 프론트엔드 LoginScreen은 시뮬레이션 상태 (`frontend/src/App.jsx:24-64`), Cognito 연동 구현 필요

---

*Architecture analysis: 2026-04-15*
