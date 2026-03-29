// ✓ c5 - 통화 이력 타임라인 컴포넌트
import React from 'react';

const RISK_COLOR = { 위험: '#ff4d4f', 주의: '#faad14', 정상: '#52c41a' };

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
            {history.map((record) => {
              const isUnanswered = record.status === '미응답';
              const dotColor = isUnanswered ? '#8c8c8c' : (RISK_COLOR[record.riskLevel] || '#d9d9d9');
              return (
                <li key={record.contactId} style={styles.item}>
                  <div style={{ ...styles.dot, background: dotColor }} />
                  <div style={styles.content}>
                    <div style={styles.metaRow}>
                      <span style={styles.date}>
                        {new Date(record.callTime).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        {' '}
                        {new Date(record.callTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ ...styles.statusBadge, background: isUnanswered ? '#8c8c8c' : '#1890ff' }}>
                        {record.status}
                      </span>
                      {record.duration != null && (
                        <span style={styles.duration}>{record.duration}분</span>
                      )}
                      {!isUnanswered && record.riskLevel && (
                        <span style={{ ...styles.riskBadge, background: dotColor }}>
                          {record.riskLevel}
                        </span>
                      )}
                    </div>
                    {!isUnanswered && (
                      <>
                        <p style={styles.reason}>{record.riskReason || '-'}</p>
                        <p style={styles.text}>{record.transcribedText}</p>
                      </>
                    )}
                    {isUnanswered && (
                      <p style={styles.unansweredNote}>전화를 받지 않았습니다.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '8px', padding: '24px', width: '660px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' },
  timeline: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', gap: '16px', marginBottom: '24px', paddingLeft: '8px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '5px' },
  content: { flex: 1 },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' },
  date: { fontSize: '13px', color: '#666' },
  statusBadge: { padding: '1px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#fff' },
  duration: { fontSize: '12px', color: '#888', background: '#f0f0f0', padding: '1px 8px', borderRadius: '4px' },
  riskBadge: { padding: '1px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#fff' },
  reason: { fontSize: '13px', color: '#444', margin: '0 0 4px 0', fontStyle: 'italic' },
  text: { fontSize: '13px', color: '#222', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  unansweredNote: { fontSize: '13px', color: '#8c8c8c', margin: 0 },
  empty: { color: '#999' },
};

export default CallTimeline;
