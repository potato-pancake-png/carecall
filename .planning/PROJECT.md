# CareCall Integration Architecture

## What This Is

CareCall: Emergency call triage system for a cloud computing course project. This project creates API specifications and integration architecture to connect the React frontend (currently using mock data) with the AWS backend (Lambda + DynamoDB + SNS), enabling the team to implement proper integration when ready.

## Core Value

Team members can easily integrate frontend with backend using clear, well-documented API contracts and data models.

## Requirements

### Validated

<!-- Existing features already implemented -->

- ✓ React frontend with emergency call UI — existing
- ✓ AWS Lambda backend functions — existing
- ✓ DynamoDB data storage — existing
- ✓ SNS notification system — existing
- ✓ Mock data system for development — existing

### Active

<!-- Design documents to create -->

- [ ] API specification documents (endpoints, request/response formats, error codes)
- [ ] TypeScript type definitions for all data models
- [ ] Integration layer architecture design (API client, service layer)
- [ ] AWS migration guide (transitioning from mock to real API)
- [ ] Data flow documentation (frontend ↔ backend communication)
- [ ] Error handling strategy specification
- [ ] Authentication/authorization design — **Amazon Cognito 사용 결정** (JWT, API Gateway Authorizer, orgId 기반 데이터 격리)

### Out of Scope

- Actual implementation of integration code — design only, implementation by team later
- Backend API development — Lambda functions already exist, need specs only
- New frontend features — focus on integration architecture, not new UI
- DevOps/deployment setup — focusing on API contracts and data flow
- Real-time features beyond current scope — SNS already handles notifications

## Context

**Academic Project:**
- University cloud computing course project
- Team collaboration: frontend and backend developers working separately
- Need clear specifications for coordinated development

**Current Architecture:**
- Frontend: React application with components, routing, and state management
- Backend: AWS Lambda functions with DynamoDB tables and SNS topics
- Gap: No actual connection - frontend uses hardcoded mock data

**Team Needs:**
- Backend team needs clear API contracts to implement
- Frontend team needs type definitions to replace mock data
- Both teams need integration architecture to follow

## Constraints

- **Scope**: Design and specification documents only — no actual integration implementation
- **Tech Stack**: Must use existing React frontend + AWS serverless backend (Lambda, DynamoDB, SNS)
- **AWS Services**: Core services decided (Lambda, DynamoDB, SNS, API Gateway, Cognito). Cognito: JWT 인증, API Gateway Authorizer 연결, orgId 기반 기관별 데이터 격리
- **Timeline**: Design documents needed before team implements integration
- **Academic**: Must demonstrate cloud computing concepts for course requirements

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design-only scope | Team will implement integration later; need clear specs first | — Pending |
| AWS serverless architecture | Course focuses on cloud services; existing backend uses Lambda + DynamoDB | — Pending |
| TypeScript for type safety | Frontend uses TypeScript; strict typing prevents integration errors | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after initialization*
