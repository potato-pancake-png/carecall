# Codebase Structure

**Analysis Date:** 2026-04-15

## Directory Layout

```
carecall/
├── backend/                           # Lambda functions and shared error classes
│   ├── schedulerLambda/              # EventBridge-triggered daily call scheduler
│   │   └── index.js                  # Fetch recipients, initiate Connect calls
│   ├── riskJudgeLambda/              # Contact Flow-triggered risk analyzer
│   │   └── index.js                  # Comprehend + Bedrock analysis, SNS alerts
│   ├── dashboardLambda/              # API Gateway handler for dashboard data
│   │   └── index.js                  # Recipient/call queries, CORS routing
│   ├── errors/                       # Shared error classes
│   │   └── AppError.js               # AppError base, ValidationError, NotFoundError, etc.
│   ├── tests/                        # Unit tests
│   │   ├── AppError.test.js
│   │   ├── schedulerLambda.test.js
│   │   ├── riskJudgeLambda.test.js
│   │   └── dashboardLambda.test.js
│   ├── package.json                  # AWS SDK dependencies
│   └── package-lock.json
├── frontend/                         # React admin dashboard
│   ├── src/
│   │   ├── App.jsx                   # Main app component, routing, state
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles, CSS variables
│   │   ├── mockData.js               # Mock recipients, call records
│   │   ├── api/
│   │   │   └── dashboardApi.js       # API client (fetch wrapper)
│   │   ├── components/
│   │   │   ├── RiskStatusPanel.jsx   # Today's risk cards, at-risk list
│   │   │   ├── RecipientList.jsx     # Recipient table with CRUD
│   │   │   ├── CallTimeline.jsx      # Call detail modal
│   │   │   └── admin/
│   │   │       ├── AdminAccountsScreen.jsx   # Admin user management
│   │   │       ├── MyAccountScreen.jsx       # Profile settings
│   │   │       ├── SecuritySettingsScreen.jsx # Security audit log
│   │   │       ├── adminMockData.js          # Admin screen mock data
│   │   │       └── adminWorkspace.css        # Admin screen styles
│   │   └── utils/
│   │       └── sort.js               # Sorting utility for risk/response status
│   ├── package.json                  # React, Vite, React DOM
│   └── node_modules/
├── docs/
│   └── architecture.md               # High-level system design
├── .planning/
│   └── codebase/                     # Analysis documents (this folder)
│       ├── ARCHITECTURE.md           # Architecture patterns
│       └── STRUCTURE.md              # This file
├── CLAUDE.md                         # Sprint agent system rules
├── package.json                      # Root package (empty scripts)
└── .gitignore
```

## Directory Purposes

**backend:**
- Purpose: Serverless Lambda functions for call processing, risk analysis, and data retrieval
- Contains: Handler functions, error classes, integration with AWS services
- Key files: `schedulerLambda/index.js`, `riskJudgeLambda/index.js`, `dashboardLambda/index.js`

**backend/errors:**
- Purpose: Shared error class hierarchy
- Contains: AppError base class, typed errors (ValidationError, NotFoundError, ExternalServiceError, DatabaseError)
- Key files: `AppError.js`

**backend/tests:**
- Purpose: Unit and integration test files
- Contains: Test suites for each Lambda handler and error classes
- Key files: `*.test.js` (Jest-compatible format)

**frontend/src:**
- Purpose: React application source code
- Contains: Components, styles, API client, mock data
- Key files: `App.jsx`, `main.jsx`, `index.css`

**frontend/src/components:**
- Purpose: Reusable React components for dashboard views
- Contains: Dashboard panels, recipient list, call timeline, admin screens
- Key files: `RiskStatusPanel.jsx`, `RecipientList.jsx`, `CallTimeline.jsx`

**frontend/src/components/admin:**
- Purpose: Admin management UI components
- Contains: Account management, security settings, profile screens
- Key files: `AdminAccountsScreen.jsx`, `SecuritySettingsScreen.jsx`, `adminMockData.js`

**frontend/src/api:**
- Purpose: HTTP client layer for backend communication
- Contains: Fetch wrapper, endpoint functions
- Key files: `dashboardApi.js`

**frontend/src/utils:**
- Purpose: Shared utility functions
- Contains: Sorting logic for risk/response status
- Key files: `sort.js` (sortByType function, riskOrder mapping)

**docs:**
- Purpose: Project-level documentation
- Contains: System architecture overview, AWS integration details
- Key files: `architecture.md`

## Key File Locations

**Entry Points:**

- `backend/schedulerLambda/index.js`: EventBridge trigger → fetch recipients → initiate calls
- `backend/riskJudgeLambda/index.js`: Contact Flow trigger → analyze call → assess risk
- `backend/dashboardLambda/index.js`: API Gateway routes → query DynamoDB → return JSON
- `frontend/src/main.jsx`: React root element → mount App component

**Configuration:**

- `backend/package.json`: AWS SDK versions, dependencies
- `frontend/package.json`: React, Vite, Vite plugin for React
- `frontend/vite.config.js`: Build configuration (if exists)
- `frontend/src/index.css`: CSS variables (colors, shadows, spacing)
- `CLAUDE.md`: Sprint agent system rules

**Core Logic:**

- `backend/errors/AppError.js`: Error class definitions with statusCode mappings
- `backend/schedulerLambda/index.js`: fetchTodayRecipients(), startOutboundCall(), saveDialResult()
- `backend/riskJudgeLambda/index.js`: analyzeWithComprehend(), judgeRiskWithBedrock(), sendSnsAlert(), saveCallRecord()
- `backend/dashboardLambda/index.js`: getRecipientList(), getTodayCallStatus(), getAtRiskList(), getCallHistory()

**Testing:**

- `backend/tests/AppError.test.js`: Error class validation
- `backend/tests/schedulerLambda.test.js`: Call scheduling logic
- `backend/tests/riskJudgeLambda.test.js`: Risk assessment logic
- `backend/tests/dashboardLambda.test.js`: API endpoint routing

**Mock Data & State:**

- `frontend/src/mockData.js`: RECIPIENTS, CALL_RECORDS, TODAY_STATUS, getCallHistory()
- `frontend/src/components/admin/adminMockData.js`: ADMIN_ACCOUNTS, SECURITY_EVENTS
- `frontend/src/App.jsx`: React state (isAuthenticated, currentView, recipients, etc.)

## Naming Conventions

**Files:**

- `index.js`: Lambda handler files (one per function)
- `*.test.js`: Jest test files
- `*.jsx`: React component files
- `*.css`: Stylesheets
- `*Data.js` or `*mockData.js`: Mock/test data files
- `*Api.js`: API client modules

**Directories:**

- `camelCase` for feature directories: `schedulerLambda`, `riskJudgeLambda`, `dashboardLambda`
- `lowercase` for generic directories: `errors`, `tests`, `api`, `components`, `utils`, `admin`

**Functions & Variables:**

- `camelCase` for functions: `fetchTodayRecipients()`, `analyzeWithComprehend()`, `getRecipientList()`
- `UPPER_CASE` for constants: `RECIPIENTS_TABLE`, `CALL_RESULTS_TABLE`, `BEDROCK_MODEL_ID`
- `camelCase` for React components (even though they're JSX): `RiskStatusPanel`, `RecipientList`, `CallTimeline`
- `camelCase` for event handlers: `handleTabChange()`, `handleRecipientSelect()`, `onFilterChange()`

**Types & Objects:**

- Error classes extend `AppError`: `ValidationError`, `NotFoundError`, `ExternalServiceError`, `DatabaseError`
- DynamoDB items use snake_case fields in some cases (e.g., `createdAt`, `callDate`, `riskLevel`)
- Risk levels use Korean strings: `'정상'`, `'주의'`, `'위험'`, `'미응답'`

## Where to Add New Code

**New AWS Service Integration (e.g., Lambda function):**
- Primary code: `backend/{featureLambda}/index.js` (new directory following naming pattern)
- Shared error handling: Reference `backend/errors/AppError.js`
- Tests: `backend/tests/{featureLambda}.test.js`
- Environment variables: Document in CLAUDE.md or deployment config

**New Dashboard Component:**
- Implementation: `frontend/src/components/{ComponentName}.jsx`
- Tests: Co-locate in same directory (if added later)
- Styles: Inline styles using CSS variables from `frontend/src/index.css`
- Import in: `frontend/src/App.jsx` and add to routing logic

**New API Endpoint:**
- Handler logic: Add function to `backend/dashboardLambda/index.js` (e.g., getNewData())
- Route matching: Add conditional in `handler()` with `path.endsWith()` check
- Client wrapper: Add function to `frontend/src/api/dashboardApi.js`
- UI integration: Import and call from React components

**New Admin Screen:**
- Component: `frontend/src/components/admin/{ScreenName}Screen.jsx`
- Mock data: Add to `frontend/src/components/admin/adminMockData.js`
- Navigation: Register in APP_VIEWS array in `frontend/src/App.jsx`
- Styling: Use `frontend/src/components/admin/adminWorkspace.css` or inline

**Utility Functions:**
- Shared helpers: `frontend/src/utils/{utility}.js`
- Backend utilities: Create new file in `backend/` root or relevant Lambda folder
- Example: `frontend/src/utils/sort.js` for sorting logic

## Special Directories

**node_modules:**
- Purpose: Installed dependencies from npm
- Generated: Yes (auto-created by npm install)
- Committed: No (.gitignore)

**.planning/codebase:**
- Purpose: Analysis documents for GSD orchestration
- Generated: No (manually written by mapping agent)
- Committed: Yes

**.git:**
- Purpose: Git version control
- Generated: Yes
- Committed: N/A (internal to git)

**backend/tests:**
- Purpose: Test files (currently Jest-compatible naming)
- Generated: No (manually written)
- Committed: Yes

## Import Patterns

**Frontend Imports:**

```javascript
// Component imports
import App from './App';

// API imports
import { fetchRecipients } from './api/dashboardApi';

// Utility imports
import { sortByType } from '../utils/sort';

// Mock data
import { RECIPIENTS, TODAY_STATUS } from './mockData';
```

**Backend Imports:**

```javascript
// AWS SDK clients
const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

// Error classes
const { DatabaseError, ExternalServiceError, AppError } = require('../errors/AppError');

// AWS utilities
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
```

---

*Structure analysis: 2026-04-15*
