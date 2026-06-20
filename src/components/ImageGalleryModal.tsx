'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { listStorageImages } from '@/lib/database';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder: string;
}

export default function ImageGalleryModal({ isOpen, onClose, onSelect, folder }: ImageGalleryModalProps) {
  const [images, setImages] = useState<{name: string, url: string, created_at: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('inquiries');

  useEffect(() => {
    if (isOpen) {
      setCurrentFolder('inquiries');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      listStorageImages(currentFolder, 50)
        .then(data => {
          setImages(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, currentFolder]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={20} />
            서버 이미지 불러오기
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              value={currentFolder} 
              onChange={e => setCurrentFolder(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none' }}
            >
              <option value="inquiries">내 공방 등록 (inquiries)</option>
              <option value="workshops">스튜디오 (workshops)</option>
              <option value="flea_markets">플리마켓 (flea_markets)</option>
              <option value="posters">포스터 (posters)</option>
            </select>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-primary)' }}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : images.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
              업로드된 이미지가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {images.map(img => (
                <div 
                  key={img.name} 
                  onClick={() => {
                    onSelect(img.url);
                    onClose();
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    transition: 'border-color 0.2s',
                    aspectRatio: '1',
                    backgroundColor: 'var(--color-bg-secondary)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
