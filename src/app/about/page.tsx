import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main>
      <div className="page-container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🧶</div>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Art flow map</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
            Discover Local Craft Studios & Flea Markets
          </p>

          <div style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-brown)' }}>Our Mission</h3>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Art flow map은 전 세계의 숨겨진 지역 공방(공예 스튜디오)을 발굴하고, 여행자와 로컬 창작자를 연결하는 시각적 기반의 위치 서비스입니다.
              도자기, 가죽, 향수, 캔들, 텍스타일, 주얼리 등 다양한 공예 분야의 워크샵을 손쉽게 찾고 예약할 수 있습니다.
            </p>

            <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-brown)' }}>Contact Info</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 'var(--space-2)' }}><strong>Company:</strong> Vivalab</li>
              <li style={{ marginBottom: 'var(--space-2)' }}><strong>Email:</strong> vivalabseoul@gmail.com</li>
              <li style={{ marginBottom: 'var(--space-2)' }}><strong>Location:</strong> Seoul, Republic of Korea</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
