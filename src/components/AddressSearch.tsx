'use client';
import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import DaumPostcodeEmbed from 'react-daum-postcode';

export interface AddressComponents {
  city?: string;
  district?: string;
  suburb?: string;
}

interface AddressSearchProps {
  onSelect: (address: string, lat: number, lng: number, components?: AddressComponents) => void;
  buttonText?: string;
  placeholder?: string;
}

export default function AddressSearch({ 
  onSelect, 
  buttonText = '주소 검색',
  placeholder = '검색할 주소를 입력하세요'
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleComplete = async (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setQuery(fullAddress);
    setIsOpen(false);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(data.address)}`);
      const geocodeData = await res.json();
      
      if (res.ok && geocodeData.lat && geocodeData.lng) {
        const components: AddressComponents = {
          city: data.sido,
          district: data.sigungu,
          suburb: data.bname || data.bname1 || data.bname2,
        };
        onSelect(fullAddress, geocodeData.lat, geocodeData.lng, components);
      } else {
        alert('주소의 위치 좌표를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to geocode address:', error);
      alert('주소 좌표 변환 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: 'var(--space-4)' }}>
      <label className="form-label">위치 검색 (Address Search)</label>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => setIsOpen(true)}
          readOnly
        />
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={() => setIsOpen(true)}
          disabled={isSearching}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Search size={18} style={{ marginRight: '4px' }} />
          {isSearching ? '좌표 변환 중...' : buttonText}
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            width: '90%',
            maxWidth: '500px',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <X size={24} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '16px', paddingRight: '30px' }}>주소 검색</h3>
            <div style={{ height: '400px', width: '100%' }}>
              <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
