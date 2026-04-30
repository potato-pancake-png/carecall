// 프론트엔드 목 데이터 — 시각화 강화를 위해 대량의 데이터 추가 및 정합성 수정

function makeDate(dayOffset, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const RECIPIENTS = [
  { recipientId: 'r-001', name: '김말순', phoneNumber: '010-1111-2222', age: 78, address: '서울 노원구', assignedWorker: '박복지', lastRiskLevel: '정상', autoCallEnabled: true, autoCallTime: '09:00', memo: '보청기 사용 중, 크게 말씀드려야 함', photo: null },
  { recipientId: 'r-002', name: '이철수', phoneNumber: '010-3333-4444', age: 82, address: '서울 강북구', assignedWorker: '김사회', lastRiskLevel: '주의', autoCallEnabled: true, autoCallTime: '10:30', memo: '오후 2시 이후 통화 선호', photo: null },
  { recipientId: 'r-003', name: '최영자', phoneNumber: '010-5555-6666', age: 75, address: '서울 도봉구', assignedWorker: '박복지', lastRiskLevel: '정상', autoCallEnabled: true, autoCallTime: '09:15', memo: '고혈압 약 복용 확인 필수', photo: null },
  { recipientId: 'r-004', name: '박순덕', phoneNumber: '010-7777-8888', age: 89, address: '서울 중랑구', assignedWorker: '이담당', lastRiskLevel: '위험', autoCallEnabled: false, autoCallTime: '08:45', memo: '최근 거동이 불편해지심', photo: null },
  { recipientId: 'r-005', name: '정봉식', phoneNumber: '010-9999-0000', age: 71, address: '서울 성북구', assignedWorker: '정돌봄', lastRiskLevel: '정상', autoCallEnabled: true, autoCallTime: '11:00', memo: '아들분과 주 1회 연락 중', photo: null },
  { recipientId: 'r-006', name: '오순례', phoneNumber: '010-2222-3333', age: 84, address: '서울 은평구', assignedWorker: '이담당', lastRiskLevel: '미응답', autoCallEnabled: true, autoCallTime: '09:30', memo: '전화벨 소리를 잘 못 들으실 때가 있음', photo: null },
];

const conversationNormal = (name) => [
  { speaker: 'AI', text: `안녕하세요, ${name} 어르신! AI 안부전화입니다. 오늘 아침은 잘 챙겨 드셨나요?` },
  { speaker: '대상자', text: '응, 방금 된장찌개 끓여서 맛있게 먹었어. 날씨가 참 좋네.' },
  { speaker: 'AI', text: '맛있는 식사 하셨다니 정말 다행이에요! 오늘 혹시 어디 편찮으신 곳은 없으신가요?' },
  { speaker: '대상자', text: '응, 특별히 아픈 데는 없어. 그냥 조금 나른한 정도지 뭐.' },
  { speaker: 'AI', text: '나른하실 땐 가벼운 스트레칭이 도움이 된대요. 오늘 하루도 즐겁고 건강하게 보내세요!' },
  { speaker: '대상자', text: '고마워요. 매번 이렇게 전화 줘서 든든하네.' },
  { speaker: 'AI', text: '별씀을요! 제가 항상 곁에 있을게요. 그럼 다음 통화 때 뵙겠습니다. 안녕히 계세요.' },
  { speaker: '대상자', text: '그래요, 잘 들어가요.' },
];

const conversationWarning = (name) => [
  { speaker: 'AI', text: `안녕하세요, ${name} 어르신. 잘 지내고 계셨나요? 목소리가 조금 힘이 없으신 것 같아요.` },
  { speaker: '대상자', text: '응... 사실 어제부터 무릎이 너무 쑤셔서 잠을 좀 설쳤어.' },
  { speaker: 'AI', text: '아이고, 무릎 통증 때문에 고생이 많으시겠어요. 약은 챙겨 드셨나요?' },
  { speaker: '대상자', text: '집에 있는 파스만 좀 붙였는데, 계속 욱신거리네. 입맛도 별로 없고...' },
  { speaker: 'AI', text: '식사를 못 하시면 기운이 더 없으실 텐데 걱정입니다. 파스 말고 병원 진료를 받아보시는 건 어떨까요?' },
  { speaker: '대상자', text: '조금 더 지켜보고 안 나으면 가야지 뭐. 혼자 가기도 번거롭고 해서.' },
  { speaker: 'AI', text: '어르신, 아픈 걸 참으시면 더 큰 병이 될 수 있어요. 복지사님께 말씀드려 볼 테니 꼭 확인해 보세요.' },
  { speaker: '대상자', text: '그래, 신경 써줘서 고마워요.' },
  { speaker: 'AI', text: '네, 식사 꼭 챙기시고 무리하지 마세요. 곧 다시 연락드릴게요. 안녕히 계세요.' },
  { speaker: '대상자', text: '응, 들어가요.' },
];

const conversationDanger = (name) => [
  { speaker: 'AI', text: `안녕하세요, ${name} 어르신. AI 안부전화입니다. 오늘 하루 어떻게 보내고 계신가요?` },
  { speaker: '대상자', text: '......' },
  { speaker: 'AI', text: '어르신? 제 목소리 들리시나요? 어디 불편하신 건 아니시죠?' },
  { speaker: '대상자', text: '(작은 목소리로) 그냥... 다 귀찮아. 아무것도 하기 싫고 밥도 안 먹었어.' },
  { speaker: 'AI', text: '밥을 안 드셨다니 너무 걱정돼요. 어제도 식사를 거르셨던데, 무슨 힘든 일이 있으신가요?' },
  { speaker: '대상자', text: '몰라... 그냥 사는 게 의미가 없는 것 같아. 몸도 무겁고 마음도 답답해.' },
  { speaker: 'AI', text: '어르신, 그런 마음이 드실 때 혼자 계시면 더 힘드실 수 있어요. 제가 지금 바로 복지사님께 연락해서 방문하시도록 할게요.' },
  { speaker: '대상자', text: '아니야, 오지 말라고 해... 그냥 혼자 있고 싶어.' },
  { speaker: 'AI', text: '아니에요, 어르신. 건강 상태가 우려되어 꼭 뵙고 확인이 필요할 것 같아요. 금방 가실 테니 조금만 기다려주세요.' },
  { speaker: '대상자', text: '...... (한숨)' },
  { speaker: 'AI', text: '어르신, 지금 바로 조치를 취하겠습니다. 절대 나쁜 생각 마시고 조금만 기다려주세요. 바로 다시 확인하겠습니다.' },
];

export const CALL_RECORDS = [
  // ── 오늘(Today) 기록 - 6명 전원 필수 ──────────────────────
  { contactId: 'today-1', recipientId: 'r-001', recipientName: '김말순', status: '응답', duration: 6, callTime: makeDate(0, 9, 3), sentiment: 'POSITIVE', sentimentScore: 92, riskLevel: '정상', summary: '날씨가 좋고 식사 잘함', conversation: conversationNormal('김말순'), createdAt: makeDate(0, 9, 3) },
  { contactId: 'today-2', recipientId: 'r-002', recipientName: '이철수', status: '응답', duration: 9, callTime: makeDate(0, 9, 7), sentiment: 'NEGATIVE', sentimentScore: 20, riskLevel: '주의', riskReason: '무릎 통증 재발', summary: '무릎 통증 호소', conversation: conversationWarning('이철수'), createdAt: makeDate(0, 9, 7) },
  { contactId: 'today-3', recipientId: 'r-003', recipientName: '최영자', status: '응답', duration: 4, callTime: makeDate(0, 9, 11), sentiment: 'POSITIVE', sentimentScore: 80, riskLevel: '정상', summary: '정상 범위 일상', conversation: conversationNormal('최영자'), createdAt: makeDate(0, 9, 11) },
  { contactId: 'today-4', recipientId: 'r-004', recipientName: '박순덕', status: '응답', duration: 12, callTime: makeDate(0, 9, 15), sentiment: 'NEGATIVE', sentimentScore: 5, riskLevel: '위험', riskReason: '심각한 우울감 및 무기력', summary: '식사 거부 및 무기력증', conversation: conversationDanger('박순덕'), createdAt: makeDate(0, 9, 15) },
  { contactId: 'today-5', recipientId: 'r-005', recipientName: '정봉식', status: '응답', duration: 5, callTime: makeDate(0, 9, 19), sentiment: 'POSITIVE', sentimentScore: 85, riskLevel: '정상', summary: '손자 방문 예정으로 기분 좋음', conversation: conversationNormal('정봉식'), createdAt: makeDate(0, 9, 19) },
  { contactId: 'today-6', recipientId: 'r-006', recipientName: '오순례', status: '미응답', duration: null, callTime: makeDate(0, 9, 23), sentiment: null, sentimentScore: null, riskLevel: '미응답', summary: '전화 미응답', riskReason: '3회 발신 시도 실패', conversation: [], createdAt: makeDate(0, 9, 23) },

  // ── 과거(Historical) 기록 - 통계/그래프용 ────────────────
  { contactId: 'hist-1', recipientId: 'r-001', recipientName: '김말순', status: '응답', duration: 5, callTime: makeDate(-1, 10, 0), sentiment: 'POSITIVE', sentimentScore: 88, riskLevel: '정상', summary: '안정적', conversation: conversationNormal('김말순'), createdAt: makeDate(-1, 10, 0) },
  { contactId: 'hist-2', recipientId: 'r-001', recipientName: '김말순', status: '응답', duration: 7, callTime: makeDate(-2, 9, 30), sentiment: 'POSITIVE', sentimentScore: 95, riskLevel: '정상', summary: '매우 좋음', conversation: conversationNormal('김말순'), createdAt: makeDate(-2, 9, 30) },
  { contactId: 'hist-3', recipientId: 'r-001', recipientName: '김말순', status: '응답', duration: 4, callTime: makeDate(-3, 11, 0), sentiment: 'NEUTRAL', sentimentScore: 55, riskLevel: '정상', summary: '보통', conversation: conversationNormal('김말순'), createdAt: makeDate(-3, 11, 0) },
  { contactId: 'hist-4', recipientId: 'r-004', recipientName: '박순덕', status: '응답', duration: 8, callTime: makeDate(-1, 9, 8), sentiment: 'NEGATIVE', sentimentScore: 15, riskLevel: '위험', summary: '식사 거부', conversation: conversationDanger('박순덕'), createdAt: makeDate(-1, 9, 8) },
  { contactId: 'hist-5', recipientId: 'r-004', recipientName: '박순덕', status: '응답', duration: 11, callTime: makeDate(-2, 9, 4), sentiment: 'NEGATIVE', sentimentScore: 10, riskLevel: '위험', summary: '우울감', conversation: conversationDanger('박순덕'), createdAt: makeDate(-2, 9, 4) },
];

function toLocalDateStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

const todayStr = toLocalDateStr(new Date());
export const TODAY_RECORDS = CALL_RECORDS.filter(r => toLocalDateStr(new Date(r.createdAt)) === todayStr);

const riskCounts = { 정상: 0, 주의: 0, 위험: 0, 미응답: 0 };
for (const r of TODAY_RECORDS) {
  if (r.status === '미응답' || r.riskLevel === '미응답') riskCounts['미응답']++;
  else if (riskCounts[r.riskLevel] !== undefined) riskCounts[r.riskLevel]++;
}

export const TODAY_STATUS = {
  date: todayStr,
  total: RECIPIENTS.length,
  riskCounts,
};

export function getCallHistory(recipientId) {
  return CALL_RECORDS
    .filter(r => r.recipientId === recipientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
