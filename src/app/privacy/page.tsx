import React from 'react';
import Header from '@/components/Header';

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <div className="page-container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: 'var(--space-6)' }}>개인정보처리방침 (Privacy Policy)</h1>
          <div style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
            <p><strong>1. 개인정보의 처리 목적</strong></p>
            <p>Handmade Map(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전 동의를 구합니다.</p>
            <br />
            <p><strong>2. 수집하는 개인정보 항목</strong></p>
            <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.<br />
            - 수집항목 : 이메일, 이름, 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보 등</p>
            <br />
            <p><strong>3. 개인정보의 처리 및 보유 기간</strong></p>
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <br />
            <p><strong>4. 동의 철회 및 파기</strong></p>
            <p>회원은 언제든지 개인정보 제공 동의를 철회할 수 있으며, 회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
