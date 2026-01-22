'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Share2, Trophy, MapPin, CalendarClock, UserCircle2 } from 'lucide-react';

export default function MyTicketsPage() {
  // 1. 가짜 티켓 데이터 (나중엔 DB에서 불러올 예정)
  const ticket = {
    id: 'ticket_123',
    tournamentName: '2026 치다 춘계 아마추어 오픈',
    userName: '박영승',
    userLevel: 'NTRP 4.0 (챌린저)',
    date: '2026.03.15(토)',
    location: '서울 올림픽공원 테니스장',
    tshirtSize: 'L(105)',
  };

  const handleShare = () => {
    // 실제 인스타 공유는 복잡한 기능이라, 지금은 알림으로 대체합니다.
    alert('🌟 인스타그램 스토리에 공유할 이미지를 생성합니다!\n(실제 구현 시 이미지 저장 기능 연결)');
  };

  return (
    // 전체 배경: 토스 스타일의 딥 다크 그라데이션
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0F1115] to-black text-white overflow-hidden relative font-sans">
      
      {/* 배경 데코레이션 (은은한 오로라 빛) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none opacity-40"></div>

      {/* 상단 네비게이션 */}
      <header className="relative z-20 flex items-center p-5 md:p-8">
        <Link href="/" className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center font-bold text-lg md:text-xl mr-10">나의 대회 티켓</h1>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="relative z-20 flex flex-col items-center justify-center px-5 py-10 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* =========================================
            ✨ 치다 플레이어 카드 (The Card)
            - 글래스모피즘(유리 효과) + 그라데이션 테두리
            ========================================= 
        */}
        {/* 카드 외곽선 그라데이션 (보더 역할) */}
        <div className="w-full max-w-[380px] rounded-[2.5rem] p-[3px] bg-gradient-to-br from-blue-400 via-purple-400 to-blue-600 shadow-2xl shadow-blue-900/50 relative">
            
            {/* 3D 일러스트레이션 (카드 밖으로 튀어나오게 배치) */}
            {/* 👇 실제 3D 이미지를 구해서 넣어야 합니다. 지금은 고퀄리티 외부 이미지로 대체합니다. */}
            <div className="absolute -top-20 -right-20 w-48 h-48 md:w-56 md:h-56 pointer-events-none z-30 drop-shadow-2xl animate-float-slow">
                <img 
                    src="https://cdn3d.iconscout.com/3d/premium/thumb/tennis-cup-5379586-4497548.png" 
                    alt="3D Trophy" 
                    className="w-full h-full object-contain contrast-125"
                />
            </div>

            {/* 카드 내부 (유리 질감 배경) */}
            <div className="relative h-full bg-slate-900/80 backdrop-blur-xl rounded-[2.3rem] p-8 overflow-hidden">
                {/* 카드 내부 빛 효과 */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"></div>

                {/* 1. 상단 로고 & 타이틀 */}
                <div className="text-center relative z-10 mb-10">
                    <span className="inline-block text-blue-400 font-black tracking-widest text-sm mb-2">CHIDA OFFICIAL TICKET</span>
                    <h2 className="text-3xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                        {ticket.tournamentName.split(' ').map((word, i) => (
                            <React.Fragment key={i}>{word}<br/></React.Fragment>
                        ))}
                    </h2>
                </div>

                {/* 2. 유저 정보 (핵심) */}
                <div className="flex flex-col items-center relative z-10 mb-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[2px] shadow-lg shadow-blue-500/50 mb-4">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                            <UserCircle2 size={64} className="text-slate-400 absolute translate-y-2"/>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{ticket.userName} 선수</h3>
                    <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-300 text-sm font-bold border border-blue-400/30">
                        {ticket.userLevel}
                    </span>
                </div>

                {/* 3. 하단 상세 정보 & 바코드 */}
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-slate-300 text-sm bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                        <CalendarClock size={18} className="text-blue-400"/>
                        <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                        <MapPin size={18} className="text-green-400"/>
                        <span className="line-clamp-1">{ticket.location}</span>
                    </div>
                    
                    {/* 가짜 바코드 (시각적 요소) */}
                    <div className="mt-8 opacity-70 mix-blend-screen">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Code128b.svg/1280px-Code128b.svg.png" alt="Barcode" className="w-full h-12 object-cover grayscale invert brightness-200 contrast-200"/>
                        <p className="text-center text-[10px] text-slate-500 mt-1 tracking-widest">TICKET ID: {ticket.id.toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* =========================================
            인스타 공유 버튼
            ========================================= 
        */}
        <div className="mt-12 w-full max-w-[380px]">
            <button 
                onClick={handleShare}
                className="group relative w-full flex justify-center items-center gap-3 px-8 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] shadow-xl shadow-blue-900/20 hover:shadow-blue-500/30 active:scale-95 overflow-hidden"
            >
                {/* 버튼 내부 그라데이션 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <span className="relative z-10 flex items-center gap-2">
                    <Share2 size={20} className="stroke-[2.5px]"/>
                    인스타그램 스토리에 공유하기
                </span>
            </button>
            <p className="text-slate-500 text-sm text-center mt-4">
                친구들에게 나의 대회 참가를 알려보세요! 📸
            </p>
        </div>

      </main>
    </div>
  );
}