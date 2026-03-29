// ✓ c5 - 위험도 현황 컴포넌트
import React from 'react';

const RISK_STYLE = {
  위험: { border: '1px solid #ff4d4f', background: '#fff1f0', color: '#ff4d4f' },
  주의: { border: '1px solid #faad14', background: '#fffbe6', color: '#d48806' },
  정상: { border: '1px solid #52c41a', background: '#f6ffed', color: '#389e0d' },
};

/**
 * 오늘의 통화 현황 요약 카드를 렌더링한다.
 * @param {{ todayStatus: Object }} props
 */
function TodayStatusCards({ todayStatus }) {
  if (!todayStatus) return null;
  const { total, riskCounts, date } = todayStatus;

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>오늘의 통화 현황 ({date})</h2>
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <div style={styles.cardNum}>{total}</div>
          <div style={styles.cardLabel}>총 통화 수</div>
        </div>
        {Object.entries(riskCounts || {}).map(([level, count]) => (
          <div key={level} style={{ ...styles.card, ...RISK_STYLE[level] }}>
            <div style={styles.cardNum}>{count}</div>
            <div style={styles.cardLabel}>{level}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 위험군 목록을 렌더링한다.
 * ✓ c5 - 위험도 현황을 화면에 렌더링
 * @param {{ atRiskList: Array }} props
 */
function AtRiskList({ atRiskList }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.title}>위험군 목록</h2>
      {!atRiskList || atRiskList.length === 0 ? (
        <p style={styles.empty}>현재 위험군이 없습니다.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>이름</th>
              <th style={styles.th}>위험도</th>
              <th style={styles.th}>판단 근거</th>
              <th style={styles.th}>통화 시간</th>
            </tr>
          </thead>
          <tbody>
            {atRiskList.map((r) => (
              <tr key={r.contactId} style={styles.tr}>
                <td style={styles.td}>{r.recipientName}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...RISK_STYLE[r.riskLevel] }}>
                    {r.riskLevel}
                  </span>
                </td>
                <td style={styles.td}>{r.riskReason || '-'}</td>
                <td style={styles.td}>{r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * 위험도 현황 패널 — TodayStatusCards + AtRiskList 조합
 * ✓ c5 - 위험도 현황 화면 렌더링
 */
function RiskStatusPanel({ todayStatus, atRiskList }) {
  return (
    <div>
      <TodayStatusCards todayStatus={todayStatus} />
      <AtRiskList atRiskList={atRiskList} />
    </div>
  );
}

const styles = {
  section: { marginBottom: '32px' },
  title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' },
  cardRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  card: { padding: '20px 28px', borderRadius: '8px', border: '1px solid #d9d9d9', background: '#fafafa', minWidth: '120px', textAlign: 'center' },
  cardNum: { fontSize: '32px', fontWeight: 'bold' },
  cardLabel: { fontSize: '14px', marginTop: '4px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f0f2f5', padding: '10px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #d9d9d9' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', verticalAlign: 'middle' },
  badge: { padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' },
  empty: { color: '#999' },
};

export default RiskStatusPanel;
