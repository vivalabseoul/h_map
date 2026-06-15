'use client';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { uploadImage } from '@/lib/database';

interface ImageUploadProps {
  initialUrl?: string;
  onUpload: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ initialUrl = '', onUpload, folder = 'posters' }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialUrl) {
      setImageUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Must be an image
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Compress image (~200kb, max 1200px)
      const compressedFile = await compressImage(file, 1200, 0.8);
      
      // 2. Upload to Supabase Storage
      const url = await uploadImage(compressedFile, folder);
      
      // 3. Update state and notify parent
      setImageUrl(url);
      onUpload(url);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('이미지 업로드에 실패했습니다. (Supabase Storage 버킷 설정이 완료되었는지 확인해 주세요)');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleClear = () => {
    setImageUrl('');
    onUpload('');
  };

  return (
    <div style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
      <label className="form-label">포스터/대표사진 업로드 (자동 압축)</label>
      
      {!imageUrl ? (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            backgroundColor: isUploading ? 'var(--color-bg-secondary)' : 'transparent',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isUploading) e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseOut={(e) => {
            if (!isUploading) e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <Loader2 className="animate-spin" size={32} />
              <span style={{ fontSize: '0.875rem' }}>이미지 최적화 및 업로드 중...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
              <Upload size={32} />
              <span style={{ fontSize: '0.875rem' }}>클릭하여 이미지 파일 선택 (JPG, PNG 등)</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>원본 사진(예: 5MB)도 자동으로 <strong>200KB 내외로 압축</strong>되어 빠르게 업로드됩니다.</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <img src={imageUrl} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            type="button"
            onClick={handleClear}
            style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              background: 'rgba(0,0,0,0.5)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50%', 
              width: '28px', 
              height: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </div>
  );
}
