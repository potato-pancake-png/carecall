// ✓ c5 - 통화 이력 타임라인 컴포넌트
import React from 'react';

const RISK_COLOR = { 위험: '#ff4d4f', 주의: '#faad14', 정상: '#52c41a' };

/**
 * 특정 대상자의 통화 이력을 타임라인으로 렌더링한다.
 * @param {{ history: Array, recipientName: string, onClose: Function }} props
 */
function CallTimeline({ history, recipientName, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{recipientName} — 통화 이력</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {!history || history.length === 0 ? (
          <p style={styles.empty}>통화 이력이 없습니다.</p>
        ) : (
          <ul style={styles.timeline}>
            {history.map((record) => (
              <li key={record.contactId} style={styles.item}>
                <div
                  style={{
                    ...styles.dot,
                    background: RISK_COLOR[record.riskLevel] || '#d9d9d9',
                  }}
                />
                <div style={styles.content}>
                  <div style={styles.dateRow}>
                    <span style={styles.date}>{new Date(record.createdAt).toLocaleString('ko-KR')}</span>
                    <span
                      style={{
                        ...styles.badge,
                        background: RISK_COLOR[record.riskLevel] || '#d9d9d9',
                      }}
                    >
                      {record.riskLevel || '-'}
                    </span>
                  </div>
                  <p style={styles.reason}>{record.riskReason || '-'}</p>
                  <p style={styles.text}>{record.transcribedText}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '8px', padding: '24px', width: '640px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' },
  timeline: { listStyle: 'none', padding: 0, margin: 0, position: 'relative' },
  item: { display: 'flex', gap: '16px', marginBottom: '20px', paddingLeft: '8px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  content: { flex: 1 },
  dateRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  date: { fontSize: '13px', color: '#666' },
  badge: { padding: '1px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#fff' },
  reason: { fontSize: '13px', color: '#444', margin: '0 0 4px 0', fontStyle: 'italic' },
  text: { fontSize: '13px', color: '#222', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  empty: { color: '#999' },
};

export default CallTimeline;
