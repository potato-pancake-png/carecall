import React, { useEffect, useState } from 'react';
import { ADMIN_STATUS_META, ROLE_META } from './adminMockData';

function formatDateLabel(value) {
  if (!value || value.includes('초대') || value.includes('잠금') || value.includes('방금')) {
    return value || '-';
  }

  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminAccountsScreen({ accounts, currentUser, onUpdateStatus }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(accounts[0]?.id || null);

  useEffect(() => {
    if (!accounts.some((account) => account.id === selectedId)) {
      setSelectedId(accounts[0]?.id || null);
    }
  }, [accounts, selectedId]);

  const filteredAccounts = accounts.filter((account) => {
    const matchesQuery =
      !query ||
      account.name.includes(query) ||
      account.email.toLowerCase().includes(query.toLowerCase()) ||
      account.role.includes(query);

    const matchesStatus = statusFilter === 'ALL' || account.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const selectedAccount =
    accounts.find((account) => account.id === selectedId) ||
    filteredAccounts[0] ||
    accounts[0] ||
    null;

  return (
    <div className="stack-layout">
      <section className="section-grid">
        <div className="content-surface">
          <div className="toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 이메일, 역할 검색"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INVITED">초대 대기</option>
              <option value="INACTIVE">비활성</option>
              <option value="LOCKED">잠금</option>
            </select>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>부서</th>
                  <th>최근 상태</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const statusMeta = ADMIN_STATUS_META[account.status];
                  const roleMeta = ROLE_META[account.role];

                  return (
                    <tr key={account.id}>
                      <td>
                        <div className="table-primary">{account.name}</div>
                        <div className="table-secondary">{account.email}</div>
                      </td>
                      <td>
                        <span className="inline-badge" style={buildTone(roleMeta?.tone)}>
                          {account.role}
                        </span>
                      </td>
                      <td>
                        <span className="inline-badge" style={buildTone(statusMeta?.tone)}>
                          {statusMeta?.label || account.status}
                        </span>
                      </td>
                      <td>{account.department}</td>
                      <td>{formatDateLabel(account.lastAccess)}</td>
                      <td>
                        <button
                          type="button"
                          className="table-action-button"
                          onClick={() => setSelectedId(account.id)}
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stack-layout">
          <div className="content-surface">
            <div className="surface-header surface-header--tight">
              <div>
                <h3 className="surface-title">선택 계정 상세</h3>
                <p className="surface-description">목업 상태에서 권한과 보안 상태를 미리 살펴볼 수 있습니다.</p>
              </div>
            </div>

            {selectedAccount ? (
              <div className="stack-layout stack-layout--compact">
                <div className="profile-summary">
                  <div className="profile-summary__avatar">{selectedAccount.name.slice(0, 1)}</div>
                  <div>
                    <div className="profile-summary__name">
                      {selectedAccount.name}
                      {selectedAccount.id === currentUser.id ? (
                        <span className="profile-summary__badge">현재 로그인</span>
                      ) : null}
                    </div>
                    <div className="table-secondary">{selectedAccount.email}</div>
                  </div>
                </div>

                <div className="detail-grid">
                  <DetailItem label="기관" value={selectedAccount.orgName} />
                  <DetailItem label="부서" value={selectedAccount.department} />
                  <DetailItem label="직책" value={selectedAccount.title} />
                  <DetailItem label="연락처" value={selectedAccount.phone} />
                  <DetailItem label="생성일" value={formatDateLabel(selectedAccount.createdAt)} />
                  <DetailItem label="초대자" value={selectedAccount.invitedBy} />
                  <DetailItem label="접속 위치" value={selectedAccount.location} />
                </div>

                <div>
                  <div className="section-label">권한 범위</div>
                  <div className="chip-list">
                    {selectedAccount.permissions.map((permission) => (
                      <span key={permission} className="chip-token">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label">계정 상태 변경</div>
                  <div className="action-row">
                    <button type="button" className="secondary-button" onClick={() => onUpdateStatus(selectedAccount.id, 'ACTIVE')}>
                      활성
                    </button>
                    <button type="button" className="secondary-button" onClick={() => onUpdateStatus(selectedAccount.id, 'INVITED')}>
                      초대 대기
                    </button>
                    <button type="button" className="secondary-button" onClick={() => onUpdateStatus(selectedAccount.id, 'INACTIVE')}>
                      비활성
                    </button>
                    <button type="button" className="secondary-button secondary-button--danger" onClick={() => onUpdateStatus(selectedAccount.id, 'LOCKED')}>
                      잠금
                    </button>
                  </div>
                </div>

                <div className="info-panel">
                  <strong>메모</strong>
                  <p>{selectedAccount.notes}</p>
                </div>
              </div>
            ) : (
              <p className="empty-state">확인할 관리자 계정을 선택해 주세요.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function buildTone(tone) {
  if (!tone) {
    return undefined;
  }

  return {
    background: tone.background,
    color: tone.color,
    border: `1px solid ${tone.border}`,
  };
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-item__label">{label}</span>
      <strong className="detail-item__value">{value || '-'}</strong>
    </div>
  );
}

export default AdminAccountsScreen;
