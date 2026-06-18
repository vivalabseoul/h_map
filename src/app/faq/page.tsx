'use client';
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown, Search } from 'lucide-react';
import styles from './page.module.css';

type Role = 'member' | 'creator';
type Category = 'all' | 'general' | 'booking' | 'cancellation' | 'creation' | 'management';

interface FAQ {
  id: string;
  role: Role;
  category: Category;
  question: Record<string, string>;
  answer: Record<string, string>;
}

// ----------------------------------------------------
// FAQ Data
// ----------------------------------------------------
const faqData: FAQ[] = [
  // --- Members ---
  {
    id: 'm1',
    role: 'member',
    category: 'general',
    question: {
      ko: '비밀번호를 잊어버렸어요.',
      en: 'I forgot my password.',
    },
    answer: {
      ko: '로그인 화면 하단의 "비밀번호 찾기" 링크를 통해 가입하신 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.',
      en: 'You can receive a password reset link to your registered email by clicking "Forgot Password" at the bottom of the login screen.',
    }
  },
  {
    id: 'm2',
    role: 'member',
    category: 'general',
    question: {
      ko: '외국인도 플랫폼을 이용할 수 있나요?',
      en: 'Can foreigners use the platform?',
    },
    answer: {
      ko: '네, 저희 플랫폼은 한국어, 영어, 일본어 등 다국어를 지원합니다. 우측 상단의 언어 설정 버튼을 눌러 원하시는 언어로 변경 후 편리하게 이용하실 수 있습니다.',
      en: 'Yes, our platform supports multiple languages including English, Korean, and Japanese. You can change your preferred language using the language button at the top right.',
    }
  },
  {
    id: 'm3_new',
    role: 'member',
    category: 'booking',
    question: {
      ko: '클래스 예약은 어떻게 하나요?',
      en: 'How do I book a class?',
    },
    answer: {
      ko: '저희 플랫폼에서는 공방의 클래스 정보와 일정 등을 안내해 드리고 있습니다. 다만 직접적인 예약 및 결제 서비스는 아직 제공하지 않으므로, 클래스 상세 페이지에 안내된 외부 예약 링크나 공방 연락처를 통해 직접 예약해 주셔야 합니다.',
      en: 'We provide detailed class information and schedules. However, direct booking and payment services are not yet supported on our platform. Please book directly through the external links or contact info provided on the class page.',
    }
  },
  {
    id: 'm4_new',
    role: 'member',
    category: 'cancellation',
    question: {
      ko: '예약 확인 및 변경/취소는 어떻게 하나요?',
      en: 'How can I check, change, or cancel my booking?',
    },
    answer: {
      ko: '저희 플랫폼에서는 예약 진행 서비스를 제공하지 않으므로, 예약 조회나 변경, 취소 및 환불 처리는 예약을 진행하신 공방 측에 직접 문의하셔야 합니다.',
      en: 'Since we do not process bookings directly, please contact the studio directly to check, change, or cancel your reservation.',
    }
  },
  /*
  // --- 기존 FAQ 내용 (현재 사용 안함 - 외부 링크 방식으로 변경됨) ---
  {
    id: 'm3',
    role: 'member',
    category: 'booking',
    question: {
      ko: '클래스 예약은 어떻게 하나요?',
      en: 'How do I book a class?',
    },
    answer: {
      ko: '원하시는 스튜디오의 클래스 상세 페이지에서 [예약하기] 버튼을 누른 후, 날짜와 시간, 참여 인원을 선택하시고 예약자 성함 및 연락처를 기재하시면 예약이 확정됩니다.',
      en: 'Click [Book Now] on the class detail page, select a date, time, and number of participants, then fill in your name and contact number to confirm the booking.',
    }
  },
  {
    id: 'm4',
    role: 'member',
    category: 'booking',
    question: {
      ko: '예약된 내용은 어디서 확인하나요?',
      en: 'Where can I check my booking details?',
    },
    answer: {
      ko: '로그인 후 좌측 사이드바 메뉴의 [내 예약 (My Bookings)] 페이지에서 예약하신 스튜디오 명과 시간, 상태를 확인하실 수 있습니다.',
      en: 'After logging in, go to [My Bookings] in the left sidebar menu to see the studio name, time, and status of your reservations.',
    }
  },
  {
    id: 'm5',
    role: 'member',
    category: 'cancellation',
    question: {
      ko: '예약 취소 및 환불은 어떻게 진행되나요?',
      en: 'How do I cancel a booking and get a refund?',
    },
    answer: {
      ko: '마이페이지의 [내 예약] 메뉴에서 해당 건의 [예약 취소] 버튼을 눌러 취소할 수 있습니다. 단, 환불 정책은 각 스튜디오(공방)의 규정에 따르므로 상세 내용은 공방 측에 문의해 주시기 바랍니다.',
      en: 'You can cancel via the [Cancel] button in the [My Bookings] menu. However, refund policies depend on each studio\'s rules, so please contact the studio directly for details.',
    }
  },
  {
    id: 'm6',
    role: 'member',
    category: 'cancellation',
    question: {
      ko: '예약한 날짜나 시간을 변경하고 싶어요.',
      en: 'I want to change my booked date or time.',
    },
    answer: {
      ko: '안타깝게도 현재 플랫폼 내에서 날짜/시간을 직접 변경하는 기능은 지원하지 않습니다. 예약을 취소하고 다시 예약하시거나, 공방(스튜디오) 측에 직접 전화로 문의하여 일정을 조율해 주시기 바랍니다.',
      en: 'Unfortunately, direct rescheduling is not supported yet. Please cancel and rebook, or call the studio directly to adjust your schedule.',
    }
  },
  */

  // --- Creators ---
  {
    id: 'c1',
    role: 'creator',
    category: 'general',
    question: {
      ko: '크리에이터(강사) 신청은 어떻게 하나요?',
      en: 'How do I apply to become a creator (instructor)?',
    },
    answer: {
      ko: '회원가입 시 회원 타입을 "크리에이터"로 선택하여 가입해 주시면 됩니다. 이후 관리자의 확인 절차를 거쳐 권한이 승인됩니다.',
      en: 'Please select "Creator" as your member type when signing up for an account. Your permissions will be approved after an admin review.',
    }
  },
  {
    id: 'c2',
    role: 'creator',
    category: 'creation',
    question: {
      ko: '내 스튜디오(공방)를 여러 개 등록할 수 있나요?',
      en: 'Can I register multiple studios?',
    },
    answer: {
      ko: '네, 가능합니다! 크리에이터 대시보드의 [스튜디오 (My Studios)] 메뉴에서 "새 스튜디오 개설" 버튼을 눌러 지점별로 여러 개의 스튜디오를 관리하실 수 있습니다.',
      en: 'Yes, absolutely! You can manage multiple branches by clicking "Create Workshop" in the [My Studios] menu of the creator dashboard.',
    }
  },
  {
    id: 'c3_new',
    role: 'creator',
    category: 'creation',
    question: {
      ko: '클래스의 예약 인원 제한이나 상세 일정은 어떻게 관리하나요?',
      en: 'How do I manage the participant limit or schedule for a class?',
    },
    answer: {
      ko: '저희 플랫폼을 통해 회원들에게 클래스의 상세 정보와 일정 등을 안내해 드릴 수 있습니다. 다만 실시간 예약 결제 및 인원 관리 서비스는 아직 제공되지 않으므로, 안내해 주신 외부 링크나 공방 자체 채널을 통해 예약을 접수하고 일정을 관리해 주셔야 합니다.',
      en: 'You can display detailed class info and schedules on our platform. However, since we do not yet provide real-time booking and participant management services, please manage your bookings directly via your external links or own channels.',
    }
  },
  {
    id: 'c4_new',
    role: 'creator',
    category: 'management',
    question: {
      ko: '예약된 수강생 목록 확인 및 예약 관리는 어떻게 하나요?',
      en: 'How do I check booked students and manage reservations?',
    },
    answer: {
      ko: '플랫폼 내에서 자체적인 예약 진행 시스템을 아직 제공하지 않고 있습니다. 수강생 명단 확인, 예약 승인 및 취소 처리는 선생님께서 직접 운영하시는 외부 예약 채널을 통해 관리해 주시기 바랍니다.',
      en: 'We do not yet provide an internal booking system. Please check your student lists and manage cancellations directly through your own external booking channels.',
    }
  }
  /*
  // --- 기존 관리 기능 FAQ (현재 사용 안함 - 외부 링크 방식으로 변경됨) ---
  {
    id: 'c3',
    role: 'creator',
    category: 'creation',
    question: {
      ko: '클래스의 예약 인원 제한은 어떻게 설정하나요?',
      en: 'How do I set the participant limit for a class?',
    },
    answer: {
      ko: '새로운 클래스(Course)를 생성하실 때 "최대 수강 인원(Max Participants)" 항목을 기재하시면 됩니다. 이 인원은 코스의 "타임당" 예약 가능한 최대 인원수로 적용됩니다.',
      en: 'When creating a new Course, enter the "Max Participants". This limit is applied per each time slot for that course.',
    }
  },
  {
    id: 'c4',
    role: 'creator',
    category: 'management',
    question: {
      ko: '예약된 수강생의 연락처는 어디서 확인하나요?',
      en: 'Where can I find the contact numbers of booked students?',
    },
    answer: {
      ko: '크리에이터 대시보드의 [예약 현황 (Bookings)] 탭에 들어가시면, 회원들이 예약 시 기재한 예약자명과 연락처, 신청 명수를 한눈에 확인하실 수 있습니다.',
      en: 'Go to the [Bookings] tab in the creator dashboard. There you can see the name, contact number, and party size of every booking at a glance.',
    }
  },
  {
    id: 'c5',
    role: 'creator',
    category: 'management',
    question: {
      ko: '강사가 직접 수강생의 예약을 취소 처리할 수 있나요?',
      en: 'Can an instructor cancel a student\'s booking directly?',
    },
    answer: {
      ko: '네, 가능합니다. [예약 현황] 페이지 우측의 "예약 취소" 버튼을 누르시면 해당 예약이 즉시 취소 처리됩니다. (취소 시 사전에 수강생에게 연락하시길 권장합니다.)',
      en: 'Yes. By clicking the "Cancel" button on the right side of the [Bookings] page, the reservation is immediately cancelled. (We recommend contacting the student beforehand.)',
    }
  }
  */
];

const categoryLabels: Record<Category, Record<string, string>> = {
  all: { ko: '전체', en: 'All' },
  general: { ko: '일반/계정', en: 'General' },
  booking: { ko: '강의 예약', en: 'Booking' },
  cancellation: { ko: '취소/환불', en: 'Cancellation' },
  creation: { ko: '스튜디오/클래스 생성', en: 'Course Creation' },
  management: { ko: '수강생/예약 관리', en: 'Management' }
};

export default function FaqPage() {
  const { t, locale } = useLanguage();
  const [activeRole, setActiveRole] = useState<Role>('member');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const getLabel = (obj: Record<string, string>) => {
    if (locale === 'ko') return obj.ko;
    return `${obj[locale] || obj.en} (${obj.ko})`;
  };

  const BilingualText = ({ obj, isQuestion }: { obj: Record<string, string>, isQuestion?: boolean }) => {
    if (locale === 'ko') {
      return <span>{obj.ko}</span>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span>{obj[locale] || obj.en}</span>
        <span style={{
          fontSize: isQuestion ? '0.85em' : '0.9em',
          color: isQuestion ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
          fontWeight: isQuestion ? 500 : 400
        }}>
          {obj.ko}
        </span>
      </div>
    );
  };

  // Filter data based on role and category
  const filteredFaqs = faqData.filter(faq => {
    if (faq.role !== activeRole) return false;
    if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
    return true;
  });

  // Get available categories for the active role
  const availableCategories: Category[] = ['all'];
  faqData.filter(f => f.role === activeRole).forEach(f => {
    if (!availableCategories.includes(f.category)) {
      availableCategories.push(f.category);
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('FAQ') || 'FAQ (자주 묻는 질문)'}</h1>
        <p className={styles.subtitle}>Do you have any questions? Find your answers below. (궁금한 점이 있으신가요?)</p>
      </div>

      {/* Role Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeRole === 'member' ? styles.tabBtnActive : ''}`}
          onClick={() => { setActiveRole('member'); setActiveCategory('all'); setOpenId(null); }}
        >
          🧑‍🎨 For Members (수강생용)
        </button>
        <button
          className={`${styles.tabBtn} ${activeRole === 'creator' ? styles.tabBtnActive : ''}`}
          onClick={() => { setActiveRole('creator'); setActiveCategory('all'); setOpenId(null); }}
        >
          👩‍🏫 For Creators (크리에이터용)
        </button>
      </div>

      {/* Category Filters */}
      <div className={styles.filters}>
        {availableCategories.map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => { setActiveCategory(cat); setOpenId(null); }}
          >
            {getLabel(categoryLabels[cat])}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {filteredFaqs.length === 0 ? (
        <div className={styles.emptyState}>
          No questions found in this category. (해당 분류에 등록된 질문이 없습니다.)
        </div>
      ) : (
        <div className={styles.faqList}>
          {filteredFaqs.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span>Q.</span>
                    <BilingualText obj={faq.question} isQuestion />
                  </div>
                  <ChevronDown size={20} className={styles.faqIcon} />
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <strong>A.</strong>
                    <BilingualText obj={faq.answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
