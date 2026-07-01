'use client';
import React from 'react';
import ProfileForm from '@/components/ProfileForm';

export default function InstructorProfilePage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>프로필 (Profile)</h1>
          <p>프로필 사진과 이름/닉네임, 간단한 소개를 설정하세요.</p>
        </div>
      </div>
      <ProfileForm />
    </div>
  );
}
