'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import Link from 'next/link';
import { Search, MapPin, Trophy, Users, Star, ArrowRight, MessageCircle, ShieldCheck, Zap, TrendingUp, CheckCircle, Bell } from 'lucide-react';
import TournamentCard from '@/src/components/layout/tournaments/TournamentCard';
import Footer from '@/src/components/layout/Footer'; 

export default function HomePage() {
  const supabase = createClient();
  const [popularTournaments, setPopularTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyStatus, setNotifyStatus] = useState({ match: false, premium: false });

  const handleNotify = (type: 'match' | 'premium') => {
    if (notifyStatus[type]) return;
    alert('알림 신청이 완료되었습니다! 🚀\n서비스가 오픈되면 가장 먼저 문자를 보내드릴게요.');
    setNotifyStatus({ ...notifyStatus, [type]: true });
  };

  useEffect(() => {
    async function fetchPopular() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error) setPopularTournaments(data || []);
      setLoading(false);
    }
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* 1. Hero Section (라운딩 수정) */}
      <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 bg-[#F9FAFB] overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-5 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            테니스의 모든 것,<br/>
            오직 <span className="text-[#3182F6]">치다</span>에서만.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
             전국 대회 정보부터 파트너 매칭까지, 테니스인을 위한 가장 확실한 선택
          </p>
          
          {/* 검색바: rounded-full -> rounded-2xl */}
          <div className="relative max-w-3xl mx-auto shadow-2xl shadow-blue-900/10 rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <input 
              type="text" 
              placeholder="찾으시는 대회나 지역을 입력해보세요" 
              // rounded-full -> rounded-2xl
              className="w-full pl-8 pr-16 py-5 md:py-6 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-[#3182F6] transition-all outline-none text-lg font-medium"
            />
            {/* 버튼: rounded-full -> rounded-xl */}
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#3182F6] hover:bg-blue-600 text-white p-3 md:p-4 rounded-xl transition-colors">
                <Search size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Menu (라운딩 수정) */}
      <section className="relative w-full -mt-12 mb-20 z-20 px-5">
        {/* rounded-3xl -> rounded-2xl */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 md:p-8 flex justify-around items-center">
            <QuickMenuIcon icon={<Trophy size={32} className="text-[#3182F6]"/>} label="대회 찾기" desc="전국 대회 일정" href="/tournaments" />
            <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
               <QuickMenuIcon 
                  icon={<Trophy size={32} className="text-purple-500"/>} 
                  label="프로필 카드" // 변경
                  desc="나만의 선수등록증" // 변경
                  href="/my-card" // 경로 변경
                  isReady={true} 
               />
            <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
            <QuickMenuIcon icon={<MapPin size={32} className="text-green-500"/>} label="코트 예약" desc="내 주변 빈 코트" href="#" isReady={false} />
        </div>
      </section>

      {/* 3. Popular Tournaments */}
      <section className="w-full max-w-7xl mx-auto px-5 mb-32">
        <div className="flex items-end justify-between mb-8">
          <div>
             <span className="text-[#3182F6] font-bold tracking-wider text-sm md:text-base uppercase">Hot Tournaments</span>
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">🔥 지금 마감 임박한 대회</h2>
          </div>
          <Link href="/tournaments" className="hidden md:flex items-center gap-1 text-slate-500 hover:text-[#3182F6] font-medium transition-colors">
            전체 대회 보기 <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          // rounded-3xl -> rounded-2xl
          <div className="text-center py-20 text-slate-400 font-medium bg-slate-50 rounded-2xl">데이터를 불러오는 중...</div>
        ) : (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-4 px-[1px]">
            {popularTournaments.map((t) => (
              <div key={t.id} className="snap-center shrink-0 w-[85vw] md:w-auto first:pl-1 last:pr-1">
                 {/* 참고: TournamentCard 내부 라운딩은 별도 파일에서 수정 필요 */}
                 <TournamentCard data={t} isMainPage={true} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Storytelling 1 (라운딩 수정) */}
      <section className="w-full bg-[#F9FAFB] py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5">
           <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
              <div className="flex-1 text-center md:text-left z-10">
                 <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    {/* rounded-full -> rounded-md */}
                    <div className="inline-block px-4 py-1.5 rounded-md bg-blue-100 text-[#3182F6] font-bold text-sm">
                       스마트 파트너 매칭
                    </div>
                    {/* rounded-md 유지 */}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                       3월 오픈 예정
                    </span>
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    아직도 단톡방에서<br/>
                    <span className="text-slate-400">눈치보며 구하세요?</span>
                 </h2>
                 <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    내 구력과 스타일을 분석해 딱 맞는 파트너를 추천해드립니다.<br/>
                    매너 점수부터 NTRP 레벨까지, 검증된 사람과 즐기세요.
                 </p>
                 
                 {/* 버튼: rounded-xl 유지 */}
                 <button 
                    onClick={() => handleNotify('match')}
                    disabled={notifyStatus.match}
                    className={`px-8 py-4 rounded-xl font-bold text-base transition-all inline-flex items-center gap-2 shadow-lg
                        ${notifyStatus.match 
                            ? 'bg-green-500 text-white cursor-default' 
                            : 'bg-white text-[#3182F6] hover:bg-blue-50 border border-blue-100'}`}
                 >
                    {notifyStatus.match ? (
                        <>신청 완료! 오픈되면 알려드릴게요 <CheckCircle size={18}/></>
                    ) : (
                        <>오픈 알림 받기 <Bell size={18}/></>
                    )}
                 </button>
              </div>
              
              <div className="flex-1 w-full max-w-md md:max-w-full relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]"></div>
                 {/* rounded-[3rem] -> rounded-3xl (조금 더 네모나게) */}
                 <div className="relative aspect-square bg-white rounded-3xl shadow-2xl shadow-slate-200 p-8 flex items-center justify-center border border-slate-100 transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full space-y-4">
                        {/* 내부 요소 라운딩: rounded-2xl -> rounded-xl */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                           <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🎾</div>
                           <div>
                              <div className="h-4 w-32 bg-slate-200 rounded-md mb-2"></div>
                              <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                           </div>
                           <div className="ml-auto px-3 py-1 bg-blue-500 text-white text-xs rounded-md">매칭 성공</div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                           <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">🔥</div>
                           <div>
                              <div className="font-bold text-slate-900">김테니스</div>
                              <div className="text-xs text-slate-500">NTRP 4.0 · 서울 송파구</div>
                           </div>
                           <div className="ml-auto text-blue-500 font-bold text-sm">98% 일치</div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Storytelling 2 (라운딩 수정) */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5">
           <div className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-24">
              
              <div className="flex-1 w-full max-w-md md:max-w-full">
                 {/* rounded-[3rem] -> rounded-3xl */}
                 <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-inner">
                    <div className="space-y-6">
                        <div className="flex items-end gap-3 h-32 md:h-48 justify-around px-4">
                            {/* 그래프 상단: rounded-t-xl -> rounded-t-lg */}
                            <div className="w-12 bg-blue-100 rounded-t-lg h-[40%]"></div>
                            <div className="w-12 bg-blue-200 rounded-t-lg h-[60%]"></div>
                            <div className="w-12 bg-blue-300 rounded-t-lg h-[50%]"></div>
                            <div className="w-12 bg-[#3182F6] rounded-t-lg h-[80%] relative">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md">Best</div>
                            </div>
                            <div className="w-12 bg-blue-400 rounded-t-lg h-[70%]"></div>
                        </div>
                        <div className="flex justify-between text-slate-400 text-sm font-bold pt-4 border-t border-slate-200">
                            <span>Jan</span><span>May</span><span>Dec</span>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                 {/* rounded-full -> rounded-md */}
                 <div className="inline-block px-4 py-1.5 rounded-md bg-purple-100 text-purple-600 font-bold text-sm mb-6">
                    나만의 커리어 관리
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    우승 트로피,<br/>
                    <span className="text-slate-400">사진첩에만 두실 건가요?</span>
                 </h2>
                 <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    흩어져 있는 나의 대회 참가 기록과 수상 내역.<br/>
                    치다에서는 당신의 모든 땀방울이 '공식 커리어'가 됩니다.
                 </p>
                 <div className="flex flex-col gap-4">
                    {/* FeatureItem 라운딩 수정됨 */}
                    <FeatureItem icon={<TrendingUp className="text-red-500"/>} text="대회 성적 자동 그래프 분석" />
                    <FeatureItem icon={<Trophy className="text-yellow-500"/>} text="디지털 트로피 진열장 (준비중)" />
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* 6. Storytelling 3 (라운딩 수정) */}
      <section className="w-full bg-[#F9FAFB] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                낚시성 대회 정보에<br className="md:hidden"/> <span className="text-[#3182F6]">지치셨나요?</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-2xl mx-auto">
                카페, 밴드, 단톡방... <br className="md:hidden"/>여기저기 흩어진 정보 찾느라 고생하지 마세요.<br/>
                치다는 <b>실제 개최되는 검증된 대회 정보</b>만 큐레이션하여 제공합니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* TrustItem 라운딩 수정됨 */}
                <TrustItem title="실시간 업데이트" desc="취소/변경된 일정 즉시 반영" icon={<Zap size={32} className="text-[#3182F6]"/>} />
                <TrustItem title="검증된 주최자" desc="믿을 수 있는 단체의 대회만" icon={<ShieldCheck size={32} className="text-green-500"/>} />
                <TrustItem title="투명한 요강" desc="참가비, 상품 정보 100% 공개" icon={<MessageCircle size={32} className="text-purple-500"/>} />
            </div>
        </div>
      </section>


      {/* 7. Premium Banner (라운딩 수정) */}
      <section className="w-full bg-[#111] py-24 md:py-32 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left max-w-2xl">
                {/* rounded-full -> rounded-md */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/10 text-blue-300 text-xs font-bold mb-4">
                    <Star size={12} fill="currentColor"/> Premium Service
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    우승을 위한<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">가장 완벽한 파트너</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    검증된 파트너 매칭부터 우승 상금 관리, <br className="hidden md:block"/>
                    전문 코치의 피드백까지 한 번에 경험하세요.
                </p>
                {/* 버튼: rounded-xl 유지 */}
                <button 
                    onClick={() => handleNotify('premium')}
                    disabled={notifyStatus.premium}
                    className={`px-8 py-4 rounded-xl font-bold text-base transition-all inline-flex items-center gap-2
                        ${notifyStatus.premium 
                            ? 'bg-green-600 text-white cursor-default' 
                            : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                >
                    {notifyStatus.premium ? '알림 신청 완료!' : '멤버십 오픈 알림 받기'} <ArrowRight size={18}/>
                </button>
            </div>
            <div className="relative">
                 <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-white/5 to-white/0 rounded-full border border-white/10 backdrop-blur-md flex items-center justify-center relative shadow-2xl animate-pulse-slow">
                     <Trophy size={120} className="text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]" strokeWidth={1} />
                 </div>
            </div>
         </div>
      </section>

{/* =========================================
          [최종_블랙에디션] 8. Bottom CTA (Chic Black)
          - 배경: 완전 검은색 (bg-black) + 은은한 오로라 한 방울
          - 높이: py-48 -> py-24 (절반으로 축소, 컴팩트함)
          - 버튼: 검은 배경에 흰색 버튼으로 대비 극대화
      ========================================= */}
      <section className="w-full py-24 bg-black relative overflow-hidden">
         
         {/* 배경 데코레이션 (너무 밋밋하지 않게 중앙에 은은한 파란 빛 한 방울) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-4xl mx-auto px-5 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
               지금 바로 코트로<br className="md:hidden"/> 나갈 준비 되셨나요?
            </h2>
            <p className="text-slate-400 text-lg font-medium mb-10">
               고민하는 순간 마감됩니다. 3초 만에 시작해보세요.
            </p>
            
            {/* 버튼: 흰색 배경 + 검은 글씨 (가장 눈에 띔) */}
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-xl transition-all hover:-translate-y-1">
               치다 시작하기 <ArrowRight size={20}/>
            </Link>
         </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// 퀵 메뉴 컴포넌트 (라운딩 수정)
function QuickMenuIcon({ icon, label, desc, href, isReady = true }: { icon: React.ReactNode, label: string, desc: string, href: string, isReady?: boolean }) {
    const Content = () => (
        // rounded-2xl -> rounded-xl
        <div className={`flex flex-col md:flex-row items-center gap-4 p-2 md:p-4 rounded-xl transition-all ${isReady ? 'hover:bg-slate-50 cursor-pointer group' : 'opacity-50 grayscale cursor-not-allowed'}`}>
            {/* rounded-2xl -> rounded-xl */}
            <div className="p-3 md:p-4 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">
                {icon}
            </div>
            <div className="text-center md:text-left">
                <div className="font-bold text-slate-900 text-sm md:text-lg mb-0.5">{label}</div>
                <div className="text-xs md:text-sm text-slate-400 font-medium hidden md:block">{desc}</div>
                {/* rounded-full -> rounded-md */}
                {!isReady && <span className="md:hidden text-[10px] text-white bg-slate-400 px-2 py-0.5 rounded-md mt-1 inline-block">준비중</span>}
            </div>
        </div>
    );
    if (isReady) return <Link href={href} className="flex-1"><Content /></Link>;
    return <div className="flex-1"><Content /></div>;
}

// 특징 리스트 아이템 (라운딩 수정)
function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (
      // rounded-xl -> rounded-lg
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-100 shadow-sm w-full md:w-auto">
         {icon}
         <span className="font-bold text-slate-700">{text}</span>
      </div>
   )
}

// 신뢰성 아이템 (라운딩 수정)
function TrustItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        // rounded-2xl -> rounded-xl
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
            {/* rounded-full -> rounded-xl */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">{icon}</div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
            <p className="text-slate-500 text-sm">{desc}</p>
        </div>
    )
}