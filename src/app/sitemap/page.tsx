'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Home, 
  Info, 
  HelpCircle, 
  Mail, 
  Bell, 
  User, 
  LogIn, 
  UserPlus, 
  Key, 
  FileText, 
  Shield, 
  Settings, 
  PenTool, 
  Briefcase 
} from 'lucide-react';
import styles from './page.module.css';

interface SitemapLink {
  href: string;
  ko: string;
  en: string;
  icon: React.ReactNode;
}

interface SitemapSection {
  id: string;
  title: {
    ko: string;
    en: string;
  };
  icon: React.ReactNode;
  links: SitemapLink[];
}

export default function SitemapPage() {
  const { t, locale } = useLanguage();

  const sections: SitemapSection[] = [
    {
      id: 'general',
      title: { ko: '일반/서비스', en: 'General / Service' },
      icon: <Home size={24} className={styles.icon} />,
      links: [
        { href: '/', ko: '홈', en: 'Home', icon: <Home size={18} /> },
        { href: '/about', ko: '서비스 소개', en: 'About Us', icon: <Info size={18} /> },
        { href: '/faq', ko: '자주 묻는 질문', en: 'FAQ', icon: <HelpCircle size={18} /> },
        { href: '/contact', ko: '문의하기', en: 'Contact', icon: <Mail size={18} /> },
        { href: '/notices', ko: '공지사항', en: 'Notices', icon: <Bell size={18} /> },
      ],
    },
    {
      id: 'member',
      title: { ko: '회원/계정', en: 'Member / Account' },
      icon: <User size={24} className={styles.icon} />,
      links: [
        { href: '/login', ko: '로그인', en: 'Login', icon: <LogIn size={18} /> },
        { href: '/register', ko: '회원가입', en: 'Register', icon: <UserPlus size={18} /> },
        { href: '/find-account', ko: '계정 찾기', en: 'Find Account', icon: <User size={18} /> },
        { href: '/reset-password', ko: '비밀번호 재설정', en: 'Reset Password', icon: <Key size={18} /> },
        { href: '/my', ko: '마이페이지', en: 'My Page', icon: <User size={18} /> },
      ],
    },
    {
      id: 'creator',
      title: { ko: '크리에이터/관리', en: 'Creator / Management' },
      icon: <PenTool size={24} className={styles.icon} />,
      links: [
        { href: '/instructor', ko: '강사 대시보드', en: 'Instructor Dashboard', icon: <PenTool size={18} /> },
        { href: '/market_coordinator', ko: '마켓 코디네이터', en: 'Market Coordinator', icon: <Briefcase size={18} /> },
        { href: '/admin', ko: '관리자 페이지', en: 'Admin Dashboard', icon: <Settings size={18} /> },
      ],
    },
    {
      id: 'policy',
      title: { ko: '약관 및 정책', en: 'Terms & Policies' },
      icon: <Shield size={24} className={styles.icon} />,
      links: [
        { href: '/terms', ko: '이용약관', en: 'Terms of Service', icon: <FileText size={18} /> },
        { href: '/privacy', ko: '개인정보 처리방침', en: 'Privacy Policy', icon: <Shield size={18} /> },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('Sitemap') || '사이트맵'}</h1>
        <p className={styles.subtitle}>
          {locale === 'ko' 
            ? '아트플로우맵의 모든 페이지를 한눈에 확인하세요.' 
            : 'Explore all pages of ArtFlowMap at a glance.'}
        </p>
      </div>

      <div className={styles.grid}>
        {sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {section.icon}
              {locale === 'ko' ? section.title.ko : section.title.en}
            </h2>
            <ul className={styles.linkList}>
              {section.links.map((link) => (
                <li key={link.href} className={styles.linkItem}>
                  <Link href={link.href} className={styles.link}>
                    {locale === 'ko' ? (
                      <>
                        <span>{link.ko}</span>
                        <span className={styles.linkEn}>{link.en}</span>
                      </>
                    ) : (
                      <>
                        <span>{link.en}</span>
                        <span className={styles.linkEn}>{link.ko}</span>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
