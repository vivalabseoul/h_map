'use client';
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    province?: string;
    state?: string;
    borough?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
  };
}

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
  placeholder = '검색할 주소를 입력하세요 (예: 종로구 북촌로)'
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Use OpenStreetMap Nominatim API
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search address:', error);
      alert('주소 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: NominatimResult) => {
    // Format the address a bit nicely if needed, or just use display_name
    // display_name can be very long (e.g. "123, Bukchon-ro, Jongno-gu, Seoul, 03053, South Korea")
    // But for now, we'll just use it and let the user edit it.
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Extract structured components if available
    const components: AddressComponents = {};
    if (result.address) {
      // Nominatim might return city, town, province, or state for the main level
      components.city = result.address.city || result.address.town || result.address.province || result.address.state;
      // Borough usually maps to gu (구) or gun (군)
      components.district = result.address.borough;
      // Suburb or neighbourhood maps to dong (동) or eup/myeon
      components.suburb = result.address.suburb || result.address.neighbourhood || result.address.quarter;
    }

    // We pass it to the parent
    onSelect(result.display_name, lat, lng, components);
    
    // Hide results and clear query
    setShowResults(false);
    setQuery('');
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleSearch}
          disabled={isSearching}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Search size={18} style={{ marginRight: '4px' }} />
          {isSearching ? '검색 중...' : buttonText}
        </button>
      </div>

      {showResults && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          marginTop: '4px',
          background: '#fff', 
          borderRadius: 'var(--radius-md)', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          zIndex: 1000, 
          maxHeight: '250px', 
          overflowY: 'auto',
          border: '1px solid var(--color-border)'
        }}>
          {results.length === 0 ? (
            <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            results.map((r) => (
              <div 
                key={r.place_id} 
                onClick={() => handleSelect(r)}
                style={{ 
                  padding: 'var(--space-3)', 
                  borderBottom: '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MapPin size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{r.display_name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
