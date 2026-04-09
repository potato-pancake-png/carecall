import React, { useEffect, useState } from 'react';

function MyAccountScreen({ user, onSaveProfile }) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    title: user.title,
    department: user.department,
  });

  useEffect(() => {
    setForm({
      name: user.name,
      phone: user.phone,
      title: user.title,
      department: user.department,
    });
  }, [user]);

  function handleSubmit(event) {
    event.preventDefault();
    onSaveProfile(form);
  }

  return (
    <div className="stack-layout">
      <section className="section-grid">
        <div className="content-surface">
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>이름</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>연락처</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>직책</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, title: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>부서</span>
                <input
                  value={form.department}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, department: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>기관 이메일</span>
              <input value={user.email} disabled />
            </label>

            <div className="action-row">
              <button type="submit" className="primary-button">프로필 저장</button>
            </div>
          </form>
        </div>

        <div className="stack-layout">
          <div className="content-surface">
            <h3 className="surface-title">계정 요약</h3>
            <div className="detail-grid">
              <DetailItem label="기관" value={user.orgName} />
              <DetailItem label="역할" value={user.role} />
              <DetailItem label="최근 접속" value={user.lastAccess} />
              <DetailItem label="접속 위치" value={user.location} />
            </div>
          </div>

          <div className="content-surface">
            <h3 className="surface-title">업무 범위</h3>
            <div className="chip-list">
              {user.permissions.map((permission) => (
                <span key={permission} className="chip-token">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-item__label">{label}</span>
      <strong className="detail-item__value">{value || '-'}</strong>
    </div>
  );
}

export default MyAccountScreen;
