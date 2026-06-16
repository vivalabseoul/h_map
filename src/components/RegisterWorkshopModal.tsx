'use client';
import React, { useState } from 'react';
import { createInquiry } from '@/lib/database';
import { useLanguage } from '@/context/LanguageContext';
import styles from './RegisterWorkshopModal.module.css';
import { X, Store, AtSign, Phone, User } from 'lucide-react';

interface RegisterWorkshopModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterWorkshopModal({ onClose, onSuccess }: RegisterWorkshopModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    sns: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sns) {
      alert(t('error_empty_fields') || '이름과 SNS 주소는 필수입니다.');
      return;
    }
    
    setLoading(true);
    try {
      const content = `
공방/신청자 이름: ${formData.name}
연락처: ${formData.contact}
SNS/인스타: ${formData.sns}
      `.trim();

      await createInquiry({
        userId: 'guest',
        userName: formData.name,
        userEmail: formData.contact || 'guest@example.com',
        title: '[간편 등록 신청] 새로운 공방 등록 요청',
        category: 'registration',
        content,
      });

      onSuccess();
    } catch (error) {
      console.error(error);
      alert('신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Store size={24} color="var(--color-accent)" />
          </div>
          <h2>내 공방 등록하기</h2>
          <p>아래 3가지 정보만 남겨주시면,<br/>저희가 확인 후 예쁘게 글로벌 지도에 올려드릴게요!</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label><User size={16} /> 공방 이름 (또는 신청자명)</label>
            <input
              type="text"
              placeholder="예: 서울 도자기 공방"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label><Phone size={16} /> 연락처 (선택)</label>
            <input
              type="text"
              placeholder="이메일 또는 전화번호"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label><AtSign size={16} /> SNS 또는 웹사이트</label>
            <input
              type="text"
              placeholder="인스타그램 아이디 또는 URL"
              value={formData.sns}
              onChange={(e) => setFormData({ ...formData, sns: e.target.value })}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '신청 중...' : '신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
