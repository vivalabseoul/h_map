# 위치 기반 주변 추천 기능 — 개발 기획서

작성일: 2026-08-10 · 상태: 계획 (개발 착수 전)

## 1. 배경 및 목적

- 현재 서비스는 사용자 위치 정보를 전혀 수집하지 않음 (지역 선택 드롭다운으로만 필터링).
- 웹 서비스이므로 위치 취득은 브라우저 표준 Geolocation API를 통해 이루어지며, 이는 각 브라우저 벤더(Chrome/Google, Safari/Apple, Edge/Microsoft)의 OS 위치 서비스에 의존한다. 별도 SDK 계약이나 API 키가 필요한 영역이 아니라, 브라우저가 제공하는 표준 웹 API + OS 권한 팝업을 사용하는 구조.
- 목표: 사용자의 현재 위치를 받아 **주변 공방(Workshop)·플리마켓/축제(FleaMarket)를 우선적으로 추천/정렬**하는 기능 추가.

## 2. 현재 코드 기반 확인 사항

- `Workshop`, `FleaMarket` 타입 모두 이미 `lat`, `lng` 필드를 보유 → 거리 계산에 DB 스키마 변경 불필요.
- 지도(`MapView.tsx`)는 Leaflet 기반 (Google Maps 아님) — 위치 취득과 지도 렌더링은 별개 관심사.
- 로그인은 Supabase OAuth (`google` provider 사용 중) — 이번 기능과는 무관, 혼동 방지용으로 명시.
- `AddressSearch.tsx` (Daum 우편번호 API)로 주소 검색은 이미 존재 → 위치 미허용 시 폴백 수단으로 재사용 가능.
- 개인정보 처리방침(`privacy/page.tsx`)에 이미 "위치 정보(동의 시)" 수집 항목이 명시되어 있음 → 문구는 준비돼 있으나 실제 수집 목적/보유기간 등 구체화 필요.
- Android 앱은 Capacitor 래퍼 — `@capacitor/geolocation` 플러그인 미설치 상태, `AndroidManifest.xml` 위치 권한 미설정 상태.

## 3. 범위 (MVP)

**포함**
- 사용자 현재 위치 취득 (권한 요청 UX 포함)
- 공방 + 플리마켓 통합 리스트/지도에서 "거리순" 정렬 옵션
- 리스트 카드에 거리 배지 표시 (예: "2.3km")
- 위치 미허용/실패 시 기존 지역 선택 방식으로 자연스럽게 폴백

**제외 (다음 단계로 이월)**
- 반경(radius) 필터, 지도 자동 센터링/줌
- 서버에 위치 정보 저장 (푸시 알림, 방문 통계 등 목적의 위치 저장은 별도 동의·설계 필요)
- IP 기반 위치 추정(권한 거부 시 대안) — 필요성 검토 후 결정

## 4. 기술 설계 개요

| 영역 | 방식 |
|---|---|
| 웹(PWA/브라우저) | `navigator.geolocation.getCurrentPosition()` — 표준 Web API, HTTPS(secure context) 필수 |
| Android 앱 (Capacitor) | `@capacitor/geolocation` 플러그인 추가 + `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` 권한을 `AndroidManifest.xml`에 추가 |
| 거리 계산 | Haversine 공식 유틸 함수 (`src/lib/distance.ts`, 신규) — 클라이언트에서 기존 lat/lng로 계산, 서버 왕복 불필요 |
| 상태 관리 | `FilterContext`에 `userLocation`, `locationStatus`('idle'\|'granted'\|'denied'\|'error'), `sortBy`('default'\|'distance') 추가 |
| 데이터 저장 | 위치 좌표는 세션 메모리에만 유지 (DB 저장 안 함) — 개인정보 최소 수집 원칙 |

## 5. UI/UX 변경

- `FilterBar`에 "내 주변" 정렬 토글/버튼 추가 → 클릭 시 위치 권한 요청
- 권한 거부/실패 시: 조용히 실패 처리 + 기존 지역(Region) 필터 유지, 안내 토스트만 노출
- `ListView`/`CourseCard`에 거리 배지 표시 (위치 허용 시에만)
- 지도 뷰: 위치 허용 시 사용자 위치 마커 표시 (선택 사항, MVP 우선순위 낮음)

## 6. 개인정보 처리 관련

- 위치 정보는 **기기/브라우저 단에서만 처리**, 서버 전송·DB 저장 없음 (MVP 기준) → 별도 동의 절차는 OS/브라우저 권한 팝업으로 충분.
- 개인정보 처리방침의 "위치 정보(동의 시)" 문구는 유지하되, 실제 수집 목적("주변 공방·이벤트 추천")과 "서버 미저장, 브라우저 세션 내에서만 사용" 문구를 4번 문항 근처에 보강 필요.
- 추후 서버 저장(예: 방문 통계, 맞춤 알림)으로 확장 시 별도 명시적 동의 UI 및 방침 개정 필요.

## 7. 단계별 로드맵

1. **Phase 1 (MVP)** — 위치 권한 요청 + 거리순 정렬 + 거리 배지 (웹 우선, Android는 플러그인만 추가)
2. **Phase 2** — 반경 필터, 지도 자동 센터링, 홈 화면 "내 주변" 추천 섹션
3. **Phase 3 (검토 필요)** — 서버 사이드 위치 활용(예: 근처 신규 등록 알림) — 별도 동의·정책 설계 선행

## 8. 리스크 / 고려사항

- Geolocation API는 HTTPS(secure context)에서만 동작 — 배포 도메인 HTTPS 여부 확인 필요.
- iOS Safari/PWA와 Android 앱 간 권한 요청 UX가 다름 — 플랫폼별 분기 처리 필요.
- 위치 권한 거부율이 높을 수 있으므로, 거부 시에도 기존 기능(지역 선택)이 자연스럽게 동작해야 함 (열화 우선 설계).

## 9. Phase 1 완료 기준 (Acceptance Criteria)

- [x] "내 주변" 버튼 클릭 시 위치 권한 팝업 노출 및 좌표 취득 — `FilterBar`, `FilterContext.requestNearbySort`
- [x] 취득 성공 시 리스트가 거리순으로 재정렬되고 거리 배지 표시 — `HomeClient` 정렬 + `ListView` 배지
- [x] 권한 거부/실패 시 에러 없이 기존 지역 필터 UX로 폴백 — `locationStatus: 'denied'`, 지역 필터는 그대로 유지
- [x] Android 프로젝트에 위치 플러그인 반영 (`@capacitor/geolocation` 설치 + `npx cap sync android`, 매니페스트 권한은 기존에 이미 존재) — 실기기/에뮬레이터 테스트는 별도 확인 필요
- [x] 개인정보 처리방침에 위치 정보 사용 목적·미저장 원칙 문구 반영 — `privacy/page.tsx`

### 구현 파일
- `src/lib/distance.ts` — Haversine 거리 계산, `formatDistance`
- `src/lib/geolocation.ts` — `@capacitor/geolocation` 기반 위치 취득 (웹/Android 공용)
- `src/context/FilterContext.tsx` — `userLocation`, `locationStatus`, `requestNearbySort`, `clearNearbySort`
- `src/components/FilterBar.tsx` — "내 주변" 토글 칩 버튼
- `src/components/HomeClient.tsx` — `userLocation` 존재 시 워크샵/플리마켓 거리순 정렬
- `src/components/ListView.tsx` — 그룹 정렬 시 `mapCenter`를 `userLocation`으로 대체, 카드에 거리 배지(`📍 2.3km`) 표시
- `src/app/[locale]/privacy/page.tsx` — 위치 정보 처리 목적/미저장 원칙 문구 추가

### 남은 것 (다음 세션에서 확인)
- [ ] 실기기/Android 스튜디오 빌드로 위치 권한 프롬프트 및 좌표 취득 동작 확인
- [ ] iOS Safari 등 타 브라우저에서의 권한 UX 확인 (현재 iOS 네이티브 앱은 없음, 웹 접속만 해당)
- [ ] 반경 필터·지도 자동 센터링 등 Phase 2 항목

### 2026-08-11 세션 진행
- [x] 위치기반서비스사업 신고 완료 확인 → 컴플라이언스 항목 종료
- [ ] 로컬 개발 서버로 "내 주변" 기능 브라우저 테스트

## 10. 위치정보사업자 정보 (데이터 흐름도 / 신고용)

> ⚠️ 아래는 공개 자료 기준 정리이며, 정확한 **허가번호·등록일자**는 방통위 공공데이터(data.go.kr, "방송미디어통신위원회_위치정보사업자 및 위치기반서비스 사업자 현황") 또는 위치정보지원센터(LBS@kcup.or.kr, 02-588-0185)에 재확인 필요.

### 10-1. 구조 이해

- **위치정보사업자**: 위치정보(개인위치정보)를 직접 수집·보유하고 제공하는 사업자. 허가제(방통위).
- **위치기반서비스사업자**: 위치정보사업자로부터 위치정보를 받아 부가서비스(추천, 지도 등)를 제공하는 사업자. 신고제(방통위) — **본 서비스(Art flow map)가 이 위치에 해당**.
- 본 기획에서 `navigator.geolocation`(웹)과 `@capacitor/geolocation`(Android, 내부적으로 Google Play Services Fused Location Provider 사용)을 쓰는 구조이므로, 위치 좌표는 **OS/브라우저 벤더(=아래 사업자들)가 먼저 취득**하고, 그 결과값(위경도)만 우리 서비스가 넘겨받는 구조.

### 10-2. 위치정보사업자 목록 (확인됨)

| 사업자명 | 분류 | 비고 / 확인 근거 |
|---|---|---|
| 구글코리아 유한회사 (Google Korea LLC) | 위치정보사업자 (허가) | 서울 강남구 테헤란로 152, 22층(강남파이낸스센터), 02-531-9000. Android/Chrome 위치 서비스 제공. |
| 애플코리아 유한회사 (Apple Korea LLC) | 위치정보사업자 (허가, 2009년) | 서울 강남구 영동대로 517, 3901호(삼성동 아셈타워). iOS/Safari 위치 서비스 제공. |
| 한국마이크로소프트 유한회사 (Microsoft Korea) | 위치정보사업자 (허가) | Windows/Edge 위치 서비스 제공. |
| (해당 시) SK텔레콤 / KT / LG유플러스 | 위치정보사업자 (허가) | 기지국·Wi-Fi 기반 보조 위치 정보 사용 시 해당. GPS 단독 사용 시 직접 연관성 낮음 — 실사용 방식 확정 후 재검토. |

### 10-3. 사업자별 API/기술 상세 (신고서 "위치정보시스템 구성도" 기재용)

| 사업자 | 플랫폼(본 서비스 적용 범위) | 실제 사용 API/기술 | 위치 취득 방식 | 필요 권한 | 계약/API Key |
|---|---|---|---|---|---|
| 구글코리아 유한회사 | ① Android 앱(Capacitor 빌드)<br>② 웹(Chrome 등 Chromium 브라우저) | ① **Fused Location Provider API** (`com.google.android.gms.location.FusedLocationProviderClient`, Google Play services) — `@capacitor/geolocation` 플러그인이 내부적으로 호출<br>② **W3C Geolocation API**(`navigator.geolocation`) 백엔드로 **Google Location Services** 이용 | GPS + Wi-Fi AP 신호 + 기지국 ID를 기기 또는 구글 위치서버에서 융합 추정 | Android: `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION`<br>Web: 브라우저 위치 권한 팝업 | 없음 — OS/브라우저 표준 기능. Google Maps Platform의 유료 Geolocation API는 별도 미사용 |
| 애플코리아 유한회사 | 웹(Safari, iOS/macOS 사용자가 접속 시) | **W3C Geolocation API**(`navigator.geolocation`) 백엔드로 **Apple Core Location** 프레임워크 + Apple 위치 서비스(Wi-Fi Positioning) 이용 | GPS + Wi-Fi 신호 기반 위치 추정(기기/애플 위치서버) | 브라우저 위치 권한 팝업 | 없음 — 별도 iOS 네이티브 앱 없음(현재 Android만 패키징), Safari 접속자에 한해 간접 이용 |
| 한국마이크로소프트 유한회사 | 웹(Edge 등 Windows 브라우저 사용자가 접속 시) | **W3C Geolocation API**(`navigator.geolocation`) 백엔드로 **Windows Location Platform**(`Windows.Devices.Geolocation`) 이용 | Wi-Fi 신호/기지국 기반 위치 추정(Microsoft 위치 서비스) | 브라우저 위치 권한 팝업(+ Windows OS 위치 설정) | 없음 |

> 공통: 세 사업자 모두와 **직접적인 데이터 연동 계약이나 API Key 발급이 없음** — 이용자 단말의 OS/브라우저가 표준 Geolocation API를 통해 위경도 좌표만 반환하며, 본 서비스는 그 결과값만 수신. 신고서에는 "정보주체 단말기(OS/브라우저)가 제공하는 표준 위치 API를 통해 위경도 좌표 수신, 사업자와 별도 데이터 연동 계약 없음"으로 기재 가능 — 정확한 문구는 신고 접수처(LBS@kcup.or.kr) 확인 권장.

### 10-4. 데이터 흐름 (요약)

```
[사용자 기기 GPS/Wi-Fi/기지국]
        ↓
[OS/브라우저 위치 서비스 — Google/Apple/Microsoft 위치정보사업자]
        ↓ (navigator.geolocation / Capacitor Geolocation API 응답: 위도·경도)
[Art flow map 클라이언트(브라우저/앱)]
        ↓ (서버 미전송, 세션 내 메모리에서만 사용 — Phase 1 기준)
[거리 계산(Haversine) → 정렬/추천 UI 표시]
```

- 위 구조상 Art flow map은 구글·애플·마이크로소프트와 **별도 계약이나 API 키 없이** 표준 브라우저/OS API만 사용 — 다만 규제상으로는 이들이 "위치정보사업자", 우리가 "위치기반서비스사업자"로 분류될 수 있음.
- Phase 1(서버 미저장) 범위에서는 위치정보를 제3자에게 제공/공유하지 않으므로 "제공" 관련 조항 부담은 낮으나, **위치기반서비스사업 신고 자체는 서버 저장 여부와 무관하게 필요할 수 있음** → 신고 대상 여부는 LBS@kcup.or.kr 문의로 최종 확인 권장.

### 10-5. 다음 액션 (법무/컴플라이언스)

- [x] 위치기반서비스사업 신고 완료 (2026-08-11 기준) — 추가 확인 불필요

### 출처

- [위치기반서비스 사업신고 안내 — 위치정보지원센터(LBSC)](https://www.lbsc.kr/front/content/contentViewer.do?contentId=CONTENT_0000081)
- [방송통신위원회 — 위치정보사업 허가 및 위치기반서비스사업 신고 안내](https://kcc.go.kr/user.do?mode=view&page=A02060600&dc=K02060600&boardId=1080&cp=1&boardSeq=31228)
- [방송미디어통신위원회 — 애플·구글 등 위치정보사업자 행정처분 보도자료](https://kmcc.go.kr/user.do?boardId=1113&boardSeq=61792&cp=1&dc=K05030000&mode=view&page=A05030000)
- [방송미디어통신위원회_위치정보사업자 및 위치기반서비스 사업자 현황 (공공데이터포털)](https://www.data.go.kr/data/15022357/fileData.do)
- [Google 위치정보서비스 및 위치기반서비스 이용약관](https://policies.google.com/terms/location?hl=ko)
- [Microsoft 한국 거주자를 위한 개인정보 관련 추가 정보](https://www.microsoft.com/ko-kr/privacy/privacysupplement)
- [위치정보의 보호 및 이용 등에 관한 법률 (국가법령정보센터)](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=125348)
