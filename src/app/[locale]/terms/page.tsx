import React from 'react';
import SubPageLayout from '@/components/SubPageLayout';

export default function TermsPage() {
  return (
    <SubPageLayout
      title="사이트 이용약관 (Terms of Service)"
      subtitle="Art flow map 서비스 이용과 관련한 기본 규정 및 책임사항을 안내합니다."
      categoryBadge="Terms & Policy"
      icon="terms"
    >
      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          제 1 조 (목적)
        </h3>
        <p>
          본 약관은 Art flow map(이하 "회사")이 제공하는 위치 기반 공방 검색 및 클래스/축제 안내 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          제 2 조 (용어의 정의)
        </h3>
        <p style={{ marginBottom: '8px' }}>
          1. <strong>"회원"</strong>이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
        </p>
        <p>
          2. <strong>"크리에이터"</strong>란 서비스를 통해 자신의 공방(스튜디오) 및 원데이 클래스, 플리마켓 정보를 등록 및 관리하는 자를 말합니다.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          제 3 조 (서비스의 제공 및 변경)
        </h3>
        <p>
          회사는 공방 검색, 지도 위치 서비스, 정보 공유 및 문의 연결 등의 서비스를 제공하며, 운영상 또는 기술상 필요에 따라 제공 서비스의 일부를 변경하거나 보완할 수 있습니다.
        </p>
      </section>

      <section>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          제 4 조 (이용자의 의무 및 제재)
        </h3>
        <p>
          회원은 타인의 정보 도용, 허위 정보 등록, 시스템 운영 방해 행위를 하여서는 아니 되며, 위반 시 회사는 서비스 이용 제한 및 계정 조치를 취할 수 있습니다.
        </p>
      </section>
    </SubPageLayout>
  );
}
