import React, { useState } from 'react';
import type { Course, Workshop } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getWorkshopById, getBookedParticipants } from '@/lib/database';
import { MapPin, Calendar, Clock } from 'lucide-react';

interface BookingModalProps {
  course: Course;
  onClose: () => void;
  onConfirm: (date: string, time: string, participants: number, phone: string, name: string) => void;
}

export default function BookingModal({ course, onClose, onConfirm }: BookingModalProps) {
  const { t, locale } = useLanguage();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [availableSpots, setAvailableSpots] = useState<number | null>(null);
  const [loadingSpots, setLoadingSpots] = useState(false);

  React.useEffect(() => {
    if (course.workshopId) {
      getWorkshopById(course.workshopId).then(setWorkshop);
    }
  }, [course.workshopId]);

  React.useEffect(() => {
    if (selectedDate && selectedTime) {
      setLoadingSpots(true);
      getBookedParticipants(course.id, selectedDate, selectedTime).then(booked => {
        const spots = course.maxParticipants - booked;
        setAvailableSpots(spots > 0 ? spots : 0);
        setParticipants(1);
        setLoadingSpots(false);
      });
    } else {
      setAvailableSpots(null);
    }
  }, [selectedDate, selectedTime, course.id, course.maxParticipants]);

  const today = new Date().toISOString().split('T')[0];
  const minDate = course.startDate > today ? course.startDate : today;
  const maxDate = course.endDate || '2099-12-31';

  const isDayValid = (dateStr: string) => {
    if (!course.availableDays || course.availableDays.length === 0) return true; // if not set, assume all days
    const day = new Date(dateStr).getDay();
    return course.availableDays.includes(day);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    setSelectedTime(''); // reset time when date changes
    
    if (val && !isDayValid(val)) {
      alert('This day is not available. Please choose another date.\n해당 요일은 클래스가 운영되지 않습니다. 다른 날짜를 선택해주세요.');
      setSelectedDate('');
    }
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time.\n날짜와 시간을 모두 선택해주세요.');
      return;
    }
    if (!userName.trim()) {
      alert('Please enter your name.\n예약자 성함을 입력해주세요.');
      return;
    }
    if (!userPhone.trim()) {
      alert('Please enter your phone number.\n연락처를 입력해주세요.');
      return;
    }
    onConfirm(selectedDate, selectedTime, participants, userPhone, userName);
  };

  const daysKo = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'var(--color-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {course.imageUrl && (
          <div style={{
            width: '100%',
            height: '140px',
            backgroundImage: `url(${course.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)'
          }} />
        )}

        {workshop && (
          <div style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
            {workshop.name[locale] || workshop.name.ko || ''}
          </div>
        )}
        <h3 style={{ marginBottom: 'var(--space-2)' }}>{course.title[locale] || '클래스 예약'}</h3>
        
        {course.description && course.description[locale] && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            {course.description[locale]}
          </p>
        )}
        
        {workshop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
            <MapPin size={14} />
            <span>{typeof workshop.address === 'string' ? workshop.address : workshop.address?.[locale] || workshop.address?.ko || ''}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--color-bg-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={14} style={{ color: 'var(--color-accent)' }} />
            <strong>일정:</strong> {course.startDate.split('T')[0]} {course.endDate ? `~ ${course.endDate.split('T')[0]}` : ''}
          </div>
          {course.availableDays && course.availableDays.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Clock size={14} style={{ color: 'var(--color-accent)' }} />
              <strong>요일:</strong> {course.availableDays.map(d => daysKo[d]).join(', ')}
            </div>
          )}
          {course.availableTimes && course.availableTimes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <Clock size={14} style={{ color: 'var(--color-accent)' }} />
              <div>
                <strong>시간:</strong> {course.availableTimes.join(', ')}
              </div>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          원하시는 날짜와 시간을 선택해주세요.
        </p>

        {!course.autoApprove && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255, 152, 0, 0.1)', color: '#ed6c02', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
            ℹ️ 이 클래스는 승인 후 예약이 확정됩니다.<br />
            (예약 확정 여부는 상단의 앱 내 알림(🔔)으로 전송됩니다)
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label className="form-label">날짜 선택 (Date)</label>
          <input 
            type="date" 
            className="form-input" 
            min={minDate}
            max={maxDate}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
          <label className="form-label">시간 선택 (Time)</label>
          {(!course.availableTimes || course.availableTimes.length === 0) ? (
            <input 
              type="time" 
              className="form-input" 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              {course.availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  style={{
                    padding: 'var(--space-3)',
                    background: selectedTime === time ? 'var(--color-accent)' : 'var(--color-bg-alt)',
                    color: selectedTime === time ? 'white' : 'var(--color-text)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: selectedTime === time ? 'bold' : 'normal',
                    opacity: selectedDate ? 1 : 0.5,
                  }}
                  disabled={!selectedDate}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedDate && selectedTime && (
          <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
            <label className="form-label">참여 인원 (Participants)</label>
            {loadingSpots ? (
              <div style={{ padding: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                남은 자리를 확인 중입니다...
              </div>
            ) : availableSpots !== null && availableSpots > 0 ? (
              <select 
                className="form-select" 
                value={participants} 
                onChange={(e) => setParticipants(parseInt(e.target.value))}
              >
                {Array.from({ length: availableSpots }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}명 (People)</option>
                ))}
              </select>
            ) : (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontWeight: 500, textAlign: 'center' }}>
                해당 타임은 예약이 마감되었습니다.
              </div>
            )}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">예약자 성함 (Name)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="홍길동"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
          <label className="form-label">연락처 (Phone Number)</label>
          <input 
            type="tel" 
            className="form-input" 
            placeholder="010-0000-0000"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>취소</button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm} 
            style={{ flex: 2 }} 
            disabled={!selectedDate || !selectedTime || loadingSpots || (availableSpots !== null && availableSpots <= 0)}
          >
            예약 신청 (Apply)
          </button>
        </div>
      </div>
    </div>
  );
}
