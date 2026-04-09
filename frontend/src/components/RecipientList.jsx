import React, { useState, useRef } from 'react';
import { sortByType } from '../utils/sort';

const RISK_BADGE = {
  위험: 'badge-danger',
  주의: 'badge-warning',
  정상: 'badge-success',
  미응답: 'badge-neutral',
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

export default function RecipientList({ recipients, onSelect, onUpdate, onDelete, onAdd }) {
  const [sortType, setSortType] = useState('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);

  const sortedRecipients = sortByType(
    recipients || [],
    sortType,
    (r) => r.lastRiskLevel !== '미응답' && r.lastRiskLevel !== null,
    (r) => r.lastRiskLevel
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>대상자 마스터</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>전체 {recipients?.length || 0}명의 돌봄 대상자를 관리합니다.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} onClick={() => setShowAddModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 대상자 등록
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface)' }}>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             {['default', 'response', 'risk'].map((type) => (
              <button
                key={type}
                onClick={() => setSortType(type)}
                className={`btn ${sortType === type ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
              >
                {type === 'default' ? '이름순' : type === 'response' ? '미통화 우선' : '위험도순'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
            최근 업데이트: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {(!recipients || recipients.length === 0) ? (
           <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-text-muted)' }}>
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
             <p style={{ fontSize: '1rem', fontWeight: 500 }}>등록된 대상자가 없습니다.</p>
             <button className="btn btn-ghost" style={{ marginTop: '1rem', color: 'var(--color-primary)' }} onClick={() => setShowAddModal(true)}>첫 대상자 등록하기</button>
           </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>대상자 정보</th>
                  <th style={{ padding: '1rem' }}>연락처 / 주소</th>
                  <th style={{ padding: '1rem' }}>참고 메모</th>
                  <th style={{ padding: '1rem' }}>최근 AI 판정</th>
                  <th style={{ padding: '1rem' }}>스마트 자동 발신</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecipients.map((r) => (
                  <tr key={r.recipientId} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                          <img src={r.photo || DEFAULT_AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>만 {r.age}세</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', fontWeight: 500 }}>{r.phoneNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.address}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ 
                        fontSize: '0.8125rem', color: 'var(--color-text-muted)', 
                        backgroundColor: 'var(--color-bg-subtle)', padding: '0.5rem 0.75rem', 
                        borderRadius: '6px', maxWidth: '200px', lineHeight: 1.4
                      }}>
                        {r.memo || <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>기입된 내용 없음</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      {r.lastRiskLevel ? (
                        <span className={`badge ${RISK_BADGE[r.lastRiskLevel] || 'badge-neutral'}`} style={{ padding: '0.25rem 0.75rem', fontWeight: 700 }}>{r.lastRiskLevel}</span>
                      ) : (
                        <span className="badge badge-neutral">기록 없음</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', 
                          borderRadius: 'var(--radius-md)', backgroundColor: r.autoCallEnabled ? 'var(--color-success-light)' : 'var(--color-bg-subtle)',
                          border: `1px solid ${r.autoCallEnabled ? 'var(--color-success)' : 'var(--color-border)'}`,
                          width: 'fit-content', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onClick={() => onUpdate && onUpdate({...r, autoCallEnabled: !r.autoCallEnabled})}
                      >
                        <div style={{ 
                          width: '32px', height: '16px', borderRadius: '16px', backgroundColor: r.autoCallEnabled ? 'var(--color-success)' : 'var(--color-border-dark)',
                          position: 'relative', transition: 'all 0.2s'
                        }}>
                          <div style={{ 
                            width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white',
                            position: 'absolute', top: '2px', left: r.autoCallEnabled ? '18px' : '2px',
                            transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                          }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.autoCallEnabled ? 'var(--color-success-hover)' : 'var(--color-text-muted)' }}>
                            {r.autoCallEnabled ? '활성' : '중단'}
                          </span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                            {r.autoCallEnabled ? `매일 ${r.autoCallTime || '09:00'}` : '수동만 가능'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', fontWeight: 700 }} onClick={() => onSelect && onSelect(r)}>이력보기</button>
                        <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setEditingRecipient(r)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--color-danger)' }} onClick={() => {
                          if (window.confirm(`${r.name}님을 삭제하시겠습니까?`)) onDelete && onDelete(r.recipientId);
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAddModal || editingRecipient) && (
        <RecipientModal
          recipient={editingRecipient}
          onClose={() => { setShowAddModal(false); setEditingRecipient(null); }}
          onSave={(data) => {
            if (editingRecipient) { onUpdate && onUpdate(data); } else { onAdd && onAdd(data); }
            setShowAddModal(false); setEditingRecipient(null);
          }}
        />
      )}
    </div>
  );
}

function RecipientModal({ recipient, onClose, onSave }) {
  const [formData, setFormData] = useState(
    recipient || { name: '', age: '', phoneNumber: '', address: '', assignedWorker: '', autoCallEnabled: true, autoCallTime: '09:00', memo: '', photo: null }
  );
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phoneNumber.trim()) { alert('이름과 연락처는 필수입니다.'); return; }
    onSave({
      ...formData,
      age: parseInt(formData.age, 10) || 0,
      recipientId: recipient?.recipientId || `r-${Date.now()}`,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '40rem' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-subtle)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{recipient ? '대상자 정보 수정' : '신규 대상자 등록'}</h3>
          <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Photo Upload Area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  width: '120px', height: '120px', borderRadius: '24px', backgroundColor: 'var(--color-bg-subtle)', 
                  border: '2px dashed var(--color-border-dark)', overflow: 'hidden', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-light)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p style={{ fontSize: '0.625rem', color: 'var(--color-text-light)', marginTop: '0.5rem', fontWeight: 600 }}>사진 등록</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
              <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }} onClick={() => fileInputRef.current.click()}>사진 변경</button>
            </div>

            {/* Fields Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">이름 *</label>
                  <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">나이</label>
                  <input type="number" className="form-input" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">연락처 *</label>
                <input type="tel" className="form-input" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">주소</label>
                <input type="text" className="form-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            {/* Bottom Fields */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">참고 메모 (대상자 특징)</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={formData.memo} 
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  placeholder="특이사항 입력..."
                />
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>AI 스마트 발신 설정</span>
                  <div 
                    style={{ 
                      width: '40px', height: '20px', borderRadius: '20px', backgroundColor: formData.autoCallEnabled ? 'var(--color-primary)' : 'var(--color-border-dark)',
                      position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onClick={() => setFormData({...formData, autoCallEnabled: !formData.autoCallEnabled})}
                  >
                    <div style={{ 
                      width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white',
                      position: 'absolute', top: '3px', left: formData.autoCallEnabled ? '23px' : '3px',
                      transition: 'all 0.2s'
                    }}></div>
                  </div>
                </div>
                {formData.autoCallEnabled && (
                  <div className="form-group">
                    <label className="form-label">발신 예약 시각</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={formData.autoCallTime} 
                      onChange={(e) => setFormData({...formData, autoCallTime: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{recipient ? '변경사항 저장' : '등록 완료'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
