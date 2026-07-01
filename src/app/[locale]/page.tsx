import HomeClient from '@/components/HomeClient';
import type { Metadata } from 'next';
import type { Locale } from '@/types';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  if (locale === 'ko') {
    return {
      title: 'Art flow map - 한국 공방 원데이 클래스 예약 플랫폼',
      description: '한국의 아름다운 전통 공예와 트렌디한 원데이 클래스를 한 곳에서 만나보세요. 도자기, 향수, 가죽 공방 등 특별한 이색 체험과 데이트 코스를 추천해드립니다.',
      keywords: ['한국 공방', '원데이 클래스', '한국 체험', '공방 데이트', '서울 공방', '외국인 한국 체험'],
      alternates: { canonical: 'https://www.artflowmap.com/ko' },
    };
  }

  return {
    title: 'Art flow map - Discover Korean Craft Workshops',
    description: 'Find the perfect handmade craft workshop and traditional Korean experience for your trip. Book local one-day classes easily.',
    keywords: ['Korean craft workshop', 'One-day class Korea', 'Korean experience', 'Seoul workshop', 'Art flow map'],
    alternates: { canonical: 'https://www.artflowmap.com/en' },
  };
}

export default function Page() {
  return <HomeClient />;
}
