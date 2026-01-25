# 🎾 치다

> **"코트 위의 모든 것을 연결하다."**
> 테니스 라이프스타일 플랫폼입니다.

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## ✨ Key Features (핵심 기능)

- **🆔 3D Player Card**: 나의 NTRP와 구력이 담긴 인터랙티브 선수 카드 발급
- **🏆 Tournament Portal**: 전국 대회 정보를 한눈에 보고 공식 신청처로 연결 (Portal)
- **📊 Dashboard MyPage**: PC/Mobile 반응형 마이페이지 (신청 내역, 찜한 대회, 계정 관리)
- **🔐 Auth & Security**: 카카오 로그인 연동 및 회원 탈퇴(Data Cleanup) 완벽 지원

## 📂 Project Structure (폴더 구조)

```bash
src/
├── app/
│   ├── admin/              # 관리자 페이지 (글쓰기 등)
│   ├── api/                # 백엔드 API (회원탈퇴 withdraw 등)
│   ├── auth/ & login/      # 카카오 로그인 및 인증 로직
│   ├── my-card/            # 3D 선수 카드 페이지
│   ├── mypage/             # 마이페이지 (신청내역, 설정, 레이아웃)
│   ├── tournaments/        # 대회 리스트 및 상세 페이지 (중개 기능)
│   └── onboarding/         # 신규 회원 초기 설정
├── components/
│   ├── layout/             # Header, Footer, BottomNav
│   ├── mypage/             # Sidebar (PC용 사이드바)
│   └── tournaments/        # ApplyButton, TournamentCard
└── utils/supabase/         # Supabase 클라이언트/서버 설정