import React from 'react';
import SubPageLayout from '@/components/SubPageLayout';

export default function AboutPage() {
  return (
    <SubPageLayout
      title="Art flow map 브랜드 소개"
      subtitle="Discover Local Craft Studios & Flea Markets Worldwide"
      categoryBadge="About Us"
      icon="about"
    >
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          우리의 비전 (Our Mission)
        </h3>
        <p style={{ marginBottom: '16px' }}>
          <strong>Art flow map</strong>은 전 세계의 숨겨진 지역 공방(공예 스튜디오) 및 플리마켓을 발굴하고, 여행자와 로컬 창작자를 직관적인 지도 기반으로 연결하는 글로벌 인터랙티브 플랫폼입니다.
        </p>
        <p style={{ marginBottom: '16px' }}>
          도자기, 가죽, 향수, 캔들, 텍스타일, 주얼리, 쿠킹 및 베이킹 클래스 등 창의적인 클래스 체험을 한곳에서 탐색하고 쉽게 방문할 수 있습니다.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          핵심 가치 (Key Features)
        </h3>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><strong>위치 기반 탐색:</strong> 현재 위치 기준 주변 공방과 축제 일정을 지도에서 바로 확인</li>
          <li><strong>다국어 지원:</strong> 한국어, English, 日本語, 簡體中文 자동 감지 및 맞춤 제공</li>
          <li><strong>글로벌 크리에이터 커뮤니티:</strong> 크리에이터의 스튜디오 등록 및 원데이 클래스 통합 예약 관리</li>
        </ul>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          사업자 및 브랜드 정보 (Corporate Info)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.9rem' }}>
          <div><strong>상호명:</strong> Moonga Corp (Vivalab Seoul)</div>
          <div><strong>대표자:</strong> Stella (Jungha) Moon</div>
          <div><strong>사업자등록번호:</strong> 274-19-02203</div>
          <div><strong>이메일:</strong> vivalabseoul@gmail.com</div>
          <div><strong>소재지:</strong> Seoul, Republic of Korea</div>
        </div>
      </section>
    </SubPageLayout>
  );
}
