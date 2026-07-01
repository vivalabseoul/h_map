import React from 'react';

export default function TermsPage() {
  return (
    <main>
      <div className="page-container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: 'var(--space-6)' }}>사이트 이용규정 (Terms of Service)</h1>
          <div style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
            <p><strong>제 1 조 (목적)</strong></p>
            <p>본 약관은 Art flow map이 제공하는 위치 기반 공방 검색 및 예약 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>
            <br />
            <p><strong>제 2 조 (용어의 정의)</strong></p>
            <p>"회원"이란 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.<br/>
            "크리에이터"란 서비스를 통해 자신의 공방(스튜디오) 및 워크샵을 등록하고 회원을 상대로 서비스를 제공하는 자를 말합니다.</p>
            <br />
            <p><strong>제 3 조 (서비스의 제공 및 변경)</strong></p>
            <p>회사는 워크샵 검색, 예약, 결제(추후 지원), 리뷰 작성 등의 서비스를 제공하며, 운영상 또는 기술상 필요에 따라 제공하고 있는 서비스의 전부 또는 일부를 변경할 수 있습니다.</p>
            <br />
            <p><strong>제 4 조 (계약 해지 및 이용 제한)</strong></p>
            <p>회원이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 회사는 경고, 일시정지, 영구이용정지(강제탈퇴) 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
