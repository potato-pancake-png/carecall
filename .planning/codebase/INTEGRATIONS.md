# External Integrations

**Analysis Date:** 2026-04-15

## APIs & External Services

**Amazon Bedrock (Claude AI):**
- Claude 3 Haiku model for risk assessment and decision making
  - SDK: @aws-sdk/client-bedrock-runtime
  - Usage: `backend/riskJudgeLambda/index.js` - `judgeRiskWithBedrock()` function
  - Prompt: Analyzes welfare call transcripts and sentiment to determine risk level (정상/주의/위험)
  - Retry logic: Up to 3 attempts with 1-second delay between retries on `ExternalServiceError`
  - Config: `BEDROCK_MODEL_ID` env var (default: `anthropic.claude-3-haiku-20240307-v1:0`)

**Amazon Comprehend:**
- Sentiment analysis for call transcripts (Korean language)
  - SDK: @aws-sdk/client-comprehend
  - Usage: `backend/riskJudgeLambda/index.js` - `analyzeWithComprehend()` function
  - Input: Transcribed call text in Korean
  - Output: Sentiment (POSITIVE/NEGATIVE/NEUTRAL/MIXED) and sentiment scores
  - Error handling: Throws `ExternalServiceError` on failure

**Amazon Connect:**
- Outbound voice calling service for welfare check-in calls
  - SDK: @aws-sdk/client-connect
  - Usage: `backend/schedulerLambda/index.js` - `startOutboundCall()` function
  - Functionality:
    - `StartOutboundVoiceContact` - Initiates outbound call to recipient phone number
    - Passes recipientId and recipientName as Attributes to contact flow
    - Returns `ContactId` for call tracking
  - Config env vars (all required):
    - `CONNECT_INSTANCE_ID` - Connect instance identifier
    - `CONNECT_CONTACT_FLOW_ID` - Contact flow to execute during call
    - `CONNECT_SOURCE_PHONE` - Originating phone number for outbound calls

## Data Storage

**DynamoDB (Database):**
- Primary data store for welfare system
  - Tables:
    - `WelfareRecipients` - Recipient profiles (env var: `RECIPIENTS_TABLE`)
      - Attributes: recipientId, name, phoneNumber, age, address, assignedWorker, etc.
      - Global Secondary Index: `callDate-index` - For querying recipients by scheduled call date
    - `WelfareCallRecords` - Call transcripts and results (env var: `CALL_RECORDS_TABLE`)
      - Attributes: contactId (primary), recipientId, transcribedText, sentiment, riskLevel, createdAt, callDate
      - Global Secondary Index: `callDate-index` - For querying calls by date
      - Global Secondary Index: `recipientId-index` - For querying call history by recipient
  - SDK: @aws-sdk/client-dynamodb with QueryCommand and ScanCommand
  - Conditional writes: `ConditionExpression: 'attribute_not_exists(contactId)'` prevents duplicate call records
  - Pagination: ExclusiveStartKey-based loops handle 1MB result limits

**File Storage:**
- Not detected - System uses in-memory mock data for frontend development

**Caching:**
- Not detected - No Redis or caching layer implemented

## Authentication & Identity

**Auth Provider:**
- Custom implementation (mock-based)
- Frontend: `frontend/src/App.jsx` - `LoginScreen` component handles email/password login
- Mock accounts in `frontend/src/components/admin/adminMockData.js` - `ADMIN_ACCOUNTS` array
- No backend authentication service integrated yet
- Admin account roles: 슈퍼 관리자, 운영 관리자, 상담 관리자, 모니터링 전용

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry or error tracking service

**Logs:**
- Console logging only: `console.error()` and `console.warn()`
- Backend logs error details before throwing custom AppError
- No centralized log aggregation service
- All three Lambda functions implement structured logging with operation names: `[DashboardLambda]`, `[RiskJudgeLambda]`, `[SchedulerLambda]`

## CI/CD & Deployment

**Hosting:**
- AWS Lambda for backend (serverless functions)
- Frontend: Static assets (Vite build output) to be deployed to S3/CloudFront

**CI Pipeline:**
- Not detected - No GitHub Actions, CodePipeline, or CI/CD configuration found

## Environment Configuration

**Required env vars:**
- Backend (Lambda):
  - `AWS_REGION` (optional: defaults to 'ap-northeast-2')
  - `RECIPIENTS_TABLE` (optional: defaults to 'WelfareRecipients')
  - `CALL_RECORDS_TABLE` (optional: defaults to 'WelfareCallRecords')
  - `SNS_ALERT_TOPIC_ARN` (required for riskJudgeLambda risk alerts)
  - `CONNECT_INSTANCE_ID` (required for schedulerLambda)
  - `CONNECT_CONTACT_FLOW_ID` (required for schedulerLambda)
  - `CONNECT_SOURCE_PHONE` (required for schedulerLambda)
  - `BEDROCK_MODEL_ID` (optional: defaults to 'anthropic.claude-3-haiku-20240307-v1:0')

- Frontend (Vite):
  - `VITE_API_BASE_URL` (optional: defaults to 'http://localhost:4000')

**Secrets location:**
- Not detected - No .env files committed
- AWS credentials: Retrieved from Lambda execution role / EC2 instance metadata

## Webhooks & Callbacks

**Incoming:**
- Amazon Connect Contact Flow callbacks trigger `riskJudgeLambda` with event payload:
  - contactId, recipientId, recipientName, transcribedText
  - Parsed in `backend/riskJudgeLambda/index.js` handler

**Outgoing:**
- SNS notifications triggered by riskJudgeLambda when riskLevel is '위험' or '주의'
  - Topic: `process.env.SNS_ALERT_TOPIC_ARN`
  - Sends alert with recipient info, risk reason, and timestamp
  - Failure in SNS does not block handler response (try-catch isolation at line 235-242)

---

*Integration audit: 2026-04-15*
