// 프론트엔드 목 데이터 — API 없이 로컬에서 동작

function makeDate(dayOffset, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const RECIPIENTS = [
  { recipientId: 'r-001', name: '김말순', phoneNumber: '010-1111-2222', age: 78, address: '서울 노원구', assignedWorker: '박복지', lastRiskLevel: '정상' },
  { recipientId: 'r-002', name: '이철수', phoneNumber: '010-3333-4444', age: 82, address: '서울 강북구', assignedWorker: '김사회', lastRiskLevel: '주의' },
  { recipientId: 'r-003', name: '최영자', phoneNumber: '010-5555-6666', age: 75, address: '서울 도봉구', assignedWorker: '박복지', lastRiskLevel: '정상' },
  { recipientId: 'r-004', name: '박순덕', phoneNumber: '010-7777-8888', age: 89, address: '서울 중랑구', assignedWorker: '이담당', lastRiskLevel: '위험' },
  { recipientId: 'r-005', name: '정봉식', phoneNumber: '010-9999-0000', age: 71, address: '서울 성북구', assignedWorker: '김사회', lastRiskLevel: '정상' },
  { recipientId: 'r-006', name: '오순례', phoneNumber: '010-2222-3333', age: 84, address: '서울 은평구', assignedWorker: '이담당', lastRiskLevel: null },
];

export const CALL_RECORDS = [
  // ── 오늘 통화 기록 ──────────────────────────────────────
  {
    contactId: 'c-001', recipientId: 'r-001', recipientName: '김말순',
    status: '응답', duration: 6,
    callTime: makeDate(0, 9, 3),
    transcribedText: '오늘 날씨도 좋고 밥도 잘 먹었어요. 별일 없어요.',
    sentiment: 'POSITIVE', riskLevel: '정상', riskReason: '일상적 대화, 긍정적 감정',
    createdAt: makeDate(0, 9, 3),
  },
  {
    contactId: 'c-002', recipientId: 'r-002', recipientName: '이철수',
    status: '응답', duration: 9,
    callTime: makeDate(0, 9, 7),
    transcribedText: '무릎이 좀 아프고 어제부터 밥맛이 없어요. 많이 힘드네요.',
    sentiment: 'NEGATIVE', riskLevel: '주의', riskReason: '가벼운 건강 이상 호소, 주기적 확인 필요',
    createdAt: makeDate(0, 9, 7),
  },
  {
    contactId: 'c-003', recipientId: 'r-003', recipientName: '최영자',
    status: '응답', duration: 4,
    callTime: makeDate(0, 9, 11),
    transcribedText: '그냥 저냥 살아요. 뭐 딱히 할 것도 없고.',
    sentiment: 'NEUTRAL', riskLevel: '정상', riskReason: '중립적 감정, 이상 없음',
    createdAt: makeDate(0, 9, 11),
  },
  {
    contactId: 'c-004', recipientId: 'r-004', recipientName: '박순덕',
    status: '응답', duration: 12,
    callTime: makeDate(0, 9, 15),
    transcribedText: '아무것도 먹지 못했고 일어나기가 너무 힘들어요. 그냥 다 귀찮아요.',
    sentiment: 'NEGATIVE', riskLevel: '위험', riskReason: '심한 무기력 및 우울 표현, 긴급 확인 필요',
    createdAt: makeDate(0, 9, 15),
  },
  {
    contactId: 'c-005', recipientId: 'r-005', recipientName: '정봉식',
    status: '응답', duration: 5,
    callTime: makeDate(0, 9, 19),
    transcribedText: '오늘 손자가 왔다 갔어요. 기분이 좋네요.',
    sentiment: 'POSITIVE', riskLevel: '정상', riskReason: '가족 방문, 긍정적 감정',
    createdAt: makeDate(0, 9, 19),
  },
  {
    contactId: 'c-006', recipientId: 'r-006', recipientName: '오순례',
    status: '미응답', duration: null,
    callTime: makeDate(0, 9, 23),
    transcribedText: null,
    sentiment: null, riskLevel: null, riskReason: '전화 미응답',
    createdAt: makeDate(0, 9, 23),
  },

  // ── 어제 통화 기록 (이력용) ─────────────────────────────
  {
    contactId: 'c-007', recipientId: 'r-002', recipientName: '이철수',
    status: '응답', duration: 7,
    callTime: makeDate(-1, 9, 5),
    transcribedText: '어제는 괜찮았는데 오늘은 조금 힘드네요.',
    sentiment: 'NEGATIVE', riskLevel: '주의', riskReason: '신체적 불편 호소',
    createdAt: makeDate(-1, 9, 5),
  },
  {
    contactId: 'c-008', recipientId: 'r-004', recipientName: '박순덕',
    status: '응답', duration: 8,
    callTime: makeDate(-1, 9, 8),
    transcribedText: '밥은 먹었어요. 그냥 몸이 무거워요.',
    sentiment: 'NEGATIVE', riskLevel: '주의', riskReason: '활동 저하 호소',
    createdAt: makeDate(-1, 9, 8),
  },
  {
    contactId: 'c-009', recipientId: 'r-001', recipientName: '김말순',
    status: '응답', duration: 5,
    callTime: makeDate(-1, 9, 12),
    transcribedText: '어제 동네 친구 만났어요. 재밌었어요.',
    sentiment: 'POSITIVE', riskLevel: '정상', riskReason: '사회적 활동, 긍정적',
    createdAt: makeDate(-1, 9, 12),
  },
  {
    contactId: 'c-010', recipientId: 'r-006', recipientName: '오순례',
    status: '미응답', duration: null,
    callTime: makeDate(-1, 9, 16),
    transcribedText: null,
    sentiment: null, riskLevel: null, riskReason: '전화 미응답',
    createdAt: makeDate(-1, 9, 16),
  },

  // ── 그저께 통화 기록 ────────────────────────────────────
  {
    contactId: 'c-011', recipientId: 'r-004', recipientName: '박순덕',
    status: '응답', duration: 11,
    callTime: makeDate(-2, 9, 4),
    transcribedText: '요즘 잠을 잘 못 자요. 밤에 너무 심심하고 무서워요.',
    sentiment: 'NEGATIVE', riskLevel: '주의', riskReason: '수면 장애 및 고독감 호소',
    createdAt: makeDate(-2, 9, 4),
  },
  {
    contactId: 'c-012', recipientId: 'r-002', recipientName: '이철수',
    status: '미응답', duration: null,
    callTime: makeDate(-2, 9, 9),
    transcribedText: null,
    sentiment: null, riskLevel: null, riskReason: '전화 미응답',
    createdAt: makeDate(-2, 9, 9),
  },
];

const todayStr = new Date().toISOString().slice(0, 10);
const todayRecords = CALL_RECORDS.filter(r => r.createdAt.slice(0, 10) === todayStr);
const riskCounts = { 정상: 0, 주의: 0, 위험: 0, 미응답: 0 };
for (const r of todayRecords) {
  if (r.status === '미응답') riskCounts['미응답']++;
  else if (riskCounts[r.riskLevel] !== undefined) riskCounts[r.riskLevel]++;
}

export const TODAY_STATUS = {
  date: todayStr,
  total: todayRecords.length,
  riskCounts,
  records: todayRecords,
};

export const AT_RISK_LIST = CALL_RECORDS.filter(
  r => r.riskLevel === '위험' || r.riskLevel === '주의' || r.status === '미응답'
).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export function getCallHistory(recipientId) {
  return CALL_RECORDS
    .filter(r => r.recipientId === recipientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
