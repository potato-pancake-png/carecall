import React, { useState } from 'react';

function formatSecurityDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SecuritySettingsScreen({ securityEvents, onChangePassword }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: '',
  });

  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      return;
    }

    onChangePassword(passwordForm);
    setPasswordForm({ currentPassword: '', nextPassword: '', confirmPassword: '' });
  }

  return (
    <div className="stack-layout">
      <section className="section-grid">
        <div className="content-surface">
          <h3 className="surface-title">비밀번호 변경</h3>
          <form className="stack-form" onSubmit={handlePasswordSubmit}>
            <label className="field">
              <span>현재 비밀번호</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    currentPassword: event.target.value,
                  }))
                }
                placeholder="현재 비밀번호"
              />
            </label>
            <label className="field">
              <span>새 비밀번호</span>
              <input
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    nextPassword: event.target.value,
                  }))
                }
                placeholder="8자 이상"
              />
            </label>
            <label className="field">
              <span>새 비밀번호 확인</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="새 비밀번호 확인"
              />
            </label>

            {passwordForm.confirmPassword &&
            passwordForm.nextPassword !== passwordForm.confirmPassword ? (
              <p className="validation-text">새 비밀번호가 일치하지 않습니다.</p>
            ) : null}

            <div className="action-row">
              <button type="submit" className="primary-button">
                비밀번호 변경 목업 저장
              </button>
            </div>
          </form>
        </div>

        <div className="content-surface">
          <h3 className="surface-title">최근 보안 활동</h3>
          <div className="timeline-list">
            {securityEvents.map((event) => (
              <div key={event.id} className="timeline-list__item">
                <div className={`severity-dot severity-dot--${event.severity}`} />
                <div>
                  <div className="timeline-list__title">{event.title}</div>
                  <div className="timeline-list__description">{event.description}</div>
                  <div className="timeline-list__meta">
                    {event.location} · {formatSecurityDate(event.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SecuritySettingsScreen;
