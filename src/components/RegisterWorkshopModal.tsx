'use client';
import React, { useState } from 'react';
import { createInquiry, uploadImage } from '@/lib/database';
import { useLanguage } from '@/context/LanguageContext';
import styles from './RegisterWorkshopModal.module.css';
import { X, Store, AtSign, Phone, User, Image as ImageIcon } from 'lucide-react';

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
  const [mainImage, setMainImage] = useState<File | null>(null);

  const resizeImageTo100KB = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          const compress = () => {
            canvas.toBlob((blob) => {
              if (blob) {
                if (blob.size > 100 * 1024 && quality > 0.1) {
                  quality -= 0.15;
                  compress();
                } else {
                  resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                }
              } else {
                resolve(file);
              }
            }, 'image/jpeg', quality);
          };
          compress();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sns) {
      alert(t('error_empty_fields') || '이름과 SNS 주소는 필수입니다.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (mainImage) {
        try {
          imageUrl = await uploadImage(mainImage, 'inquiries');
        } catch (e) {
          // fallback to base64 if supabase is not configured
          imageUrl = await new Promise((resolve) => {
             const reader = new FileReader();
             reader.onload = (ev) => resolve(ev.target?.result as string);
             reader.readAsDataURL(mainImage);
          });
        }
      }

      const content = `
공방/신청자 이름: ${formData.name}
연락처(전화번호 등): ${formData.contact || '미입력'}
SNS/인스타: ${formData.sns}
${imageUrl ? `메인이미지: ${imageUrl}` : ''}
      `.trim();

      await createInquiry({
        userId: 'guest',
        userName: formData.name,
        // 사용자가 이메일을 입력하지 않으므로 기본 이메일을 관리자 메일로 설정합니다.
        // 메일 발송 트리거가 동작하더라도 유효한 메일이므로 반송되지 않으며, 관리자에게 알림이 가는 효과도 있습니다.
        userEmail: 'vivalabseoul@gmail.com', 
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
          <p>아래 3가지 정보만 남겨주시면,<br />저희가 확인 후 예쁘게 글로벌 지도에 올려드릴게요!</p>
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
              placeholder="전화번호나 이메일 편하신 걸로 적어주세요"
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

          <div className={styles.inputGroup}>
            <label><ImageIcon size={16} /> 메인이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  const resized = await resizeImageTo100KB(file);
                  setMainImage(resized);
                }
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              공방소개에서 메인이미지로 등록됩니다. (자동으로 100kb 이하로 최적화됩니다)
            </p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '신청 중...' : '신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
