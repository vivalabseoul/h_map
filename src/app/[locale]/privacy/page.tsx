import React from 'react';
import SubPageLayout from '@/components/SubPageLayout';

export default function PrivacyPage() {
  return (
    <SubPageLayout
      title="개인정보 처리방침 (Privacy Policy)"
      subtitle="회원 여러분의 개인정보 보호를 위해 최선을 다하고 있습니다."
      categoryBadge="Privacy Protection"
      icon="privacy"
    >
      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          1. 개인정보의 수집 및 처리 목적
        </h3>
        <p>
          Art flow map은 회원가입, 사용자 인증, 위치 기반 공방 및 이벤트 안내, 문의 응대 및 맞춤형 서비스 제공을 목적으로 최소한의 개인정보를 수집·처리합니다.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          2. 수집하는 개인정보 항목
        </h3>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>필수항목:</strong> 이메일 주소, 이름(디스플레이 네임), 로그인 식별자</li>
          <li><strong>자동 수집항목:</strong> 접속 IP 정보, 쿠키, 서비스 이용 기록, 위치 정보(동의 시)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          3. 개인정보의 보유 및 파기
        </h3>
        <p>
          회원 탈퇴 요청 시 수집된 개인정보는 즉시 지체 없이 파기하며, 관계 법령에 따라 보존 의무가 있는 경우 정해진 기간 동안 안전하게 분리 보관됩니다.
        </p>
      </section>

      <section>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          4. 개인정보 관련 문의 및 담당자
        </h3>
        <p>
          개인정보 보호 관련 문의 사항은 <a href="mailto:vivalabseoul@gmail.com" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>vivalabseoul@gmail.com</a> 으로 연락 주시면 신속하게 답변드리겠습니다.
        </p>
      </section>
    </SubPageLayout>
  );
}
