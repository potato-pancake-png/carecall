# Technology Stack

**Analysis Date:** 2026-04-15

## Languages

**Primary:**
- JavaScript (Node.js) - Backend Lambda functions, CommonJS modules
- JavaScript (React 18) - Frontend dashboard application, ES modules with Vite

## Runtime

**Environment:**
- Node.js runtime for AWS Lambda backend
- Browser runtime (ES2020+) for frontend via Vite

**Package Manager:**
- npm - Both frontend and backend
- Lockfiles present: `package-lock.json` at root, frontend, and backend

## Frameworks

**Core:**
- React 18.2.0 - Frontend UI library for admin dashboard (`frontend/src/App.jsx`)
- AWS SDK for JavaScript v3 - Backend service integrations

**Frontend Build:**
- Vite 5.0.0 - Frontend build tool and dev server
- @vitejs/plugin-react 4.0.0 - React plugin for Vite

**Backend Runtime:**
- AWS Lambda - Serverless compute for three Lambda functions:
  - `backend/dashboardLambda/index.js` - Dashboard API handler
  - `backend/riskJudgeLambda/index.js` - Risk assessment handler
  - `backend/schedulerLambda/index.js` - Outbound call scheduler

**Testing:**
- Jest 29.7.0 - Test runner for backend tests
- Test files: `backend/tests/*.test.js`

## Key Dependencies

**Critical (Backend AWS Services):**
- @aws-sdk/client-dynamodb 3.0.0 - DynamoDB table queries and writes (`getRecipientList()`, `getTodayCallStatus()`, `saveCallRecord()`)
- @aws-sdk/util-dynamodb 3.0.0 - DynamoDB item marshalling/unmarshalling
- @aws-sdk/client-bedrock-runtime 3.0.0 - Claude 3 Haiku model for risk assessment (`judgeRiskWithBedrock()`)
- @aws-sdk/client-comprehend 3.0.0 - Sentiment analysis for call transcripts (`analyzeWithComprehend()`)
- @aws-sdk/client-connect 3.0.0 - Amazon Connect for outbound voice calls (`startOutboundCall()`)
- @aws-sdk/client-sns 3.0.0 - SNS notifications for risk alerts (`sendSnsAlert()`)

**Frontend:**
- react 18.2.0 - UI rendering
- react-dom 18.2.0 - DOM mounting

## Configuration

**Environment (Frontend):**
- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:4000`)
- Set in `frontend/vite.config.js` proxy configuration (line 10)

**Environment (Backend):**
- `AWS_REGION` - AWS region (default: `ap-northeast-2`)
- `RECIPIENTS_TABLE` - DynamoDB table name (default: `WelfareRecipients`)
- `CALL_RECORDS_TABLE` - DynamoDB table name (default: `WelfareCallRecords`)
- `SNS_ALERT_TOPIC_ARN` - SNS topic ARN for risk alerts (required in riskJudgeLambda)
- `CONNECT_INSTANCE_ID` - Amazon Connect instance ID (required in schedulerLambda)
- `CONNECT_CONTACT_FLOW_ID` - Connect contact flow ID (required in schedulerLambda)
- `CONNECT_SOURCE_PHONE` - Source phone number for outbound calls (required in schedulerLambda)
- `BEDROCK_MODEL_ID` - Bedrock model identifier (default: `anthropic.claude-3-haiku-20240307-v1:0`)

**Build:**
- `frontend/vite.config.js` - Vite config with React plugin and API proxy
- No TypeScript configuration (plain JavaScript)

## Platform Requirements

**Development:**
- Node.js with npm
- Vite dev server runs on port 3000 (`frontend/vite.config.js` line 7)
- Backend API expected at `http://localhost:4000` for local proxy

**Production:**
- AWS Lambda for backend (three separate functions)
- Amazon DynamoDB for data storage
- Amazon Bedrock for AI risk assessment
- Amazon Comprehend for sentiment analysis
- Amazon Connect for voice calls
- Amazon SNS for notifications
- S3 for frontend static assets
- CloudFront or API Gateway for frontend delivery

---

*Stack analysis: 2026-04-15*
