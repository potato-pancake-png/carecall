# Sprint Agent System

이 프로젝트는 세 개의 서브에이전트가 협력하는 Contract-first 개발 시스템입니다.

## 에이전트 역할

| 에이전트  | 역할                           | 허용 도구            |
| --------- | ------------------------------ | -------------------- |
| Planner   | 기능 분석 → contract.json 생성 | Read, Glob, Write    |
| Executor  | contract 기반 코드 작성        | Write, Edit, Bash    |
| Evaluator | 체크리스트 기반 코드 검증      | Read, Bash(테스트만) |

## 공유 파일 (에이전트 간 통신)

- `.sprint/contract.json` — Planner가 생성, Executor·Evaluator가 읽음
- `.sprint/evaluation.json` — Evaluator가 생성, Main이 읽고 retry 판단

## Sprint 실행 방법

```
/sprint <feature request>
```

## 주요 규칙

- Executor는 반드시 contract.json의 체크리스트를 읽고 시작한다
- Evaluator는 추측하지 않고 실제로 테스트를 실행해서 판단한다
- 각 서브에이전트는 독립 컨텍스트에서 실행된다 (Task 툴)
- 최대 3회 retry, 매번 이전 evaluation.json의 suggestion을 Executor에 전달

# 프로젝트 컨벤션

## 설계 문서

- 전체 아키텍처: `docs/architecture.md`

## 규칙

- 모든 함수는 단일 책임 원칙을 따른다
- 에러는 반드시 커스텀 에러 클래스로 처리한다
