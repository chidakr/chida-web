'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client'; // ✅ Supabase 클라이언트 경로만 수정
import {
  ChevronRight, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, ArrowRight,
  Facebook, Youtube, Instagram
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient(); // ✅ 클라이언트 생성
  
  const [hotTournaments, setHotTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotTournaments() {
      // ✅ 뷰 카운트 대신 created_at(최신순)으로 일단 가져오기 (컬럼 매칭)
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .limit(4);

      if (!error) setHotTournaments(data || []);
      setLoading(false);
    }
    fetchHotTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden flex flex-col">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[15%] left-[5%] md:left-[10%] animate-float-slow">
                <CssTennisBall size={120} />
            </div>
            <div className="absolute bottom-[20%] right-[5%] md:right-[15%] animate-float-medium delay-700">
                <CssTennisBall size={80} />
            </div>
            <div className="absolute top-[10%] right-[5%] md:right-[10%] animate-float-fast delay-300">
                 <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-200 to-blue-100 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.05),10px_10px_20px_rgba(49,130,246,0.15)] transform rotate-12 backdrop-blur-sm border border-white/50"></div>
            </div>
            <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 px-4 py-2 rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default animate-fade-in-up">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3182F6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182F6]"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">지금 <span className="text-[#3182F6] font-semibold">3,420명</span>이 대회를 찾고 있어요</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold leading-[1.15] mb-8 tracking-tight text-slate-900 animate-fade-in-up delay-100 relative drop-shadow-sm">
            테니스 대회의 모든 것,<br />
            <span className="relative inline-block">
                <span className="relative z-10 text-[#3182F6]">치다</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-100/50 -z-0 rounded-full"></span>
            </span>에서 한 번에.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-normal mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            복잡한 카페 가입, 단톡방 검색은 이제 그만.<br className="hidden md:block"/>
            전국 모든 테니스 대회 정보를 가장 쉽고 스마트하게 확인하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button
              onClick={() => router.push('/tournaments')}
              className="w-full sm:w-auto px-8 py-4 bg-[#3182F6] text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 ring-4 ring-blue-50/50"
            >
              대회 찾으러 가기 <ChevronRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              내 대회 등록하기
            </button>
          </div>
        </div>
      </section>

      {/* 2. Stats & Trust */}
      <section className="py-12 border-y border-slate-50 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem label="누적 대회 정보" value="1,200+" />
            <StatItem label="월간 방문자" value="45k" />
            <StatItem label="대회 매칭률" value="98%" />
            <StatItem label="사용자 만족도" value="4.9/5.0" />
        </div>
      </section>

      {/* 3. Hot Tournaments */}
      <section className="py-24 max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3 flex items-center gap-3">
                    <TrendingUp className="text-[#3182F6]" size={36}/> 실시간 인기 대회
                </h2>
                <p className="text-slate-500 font-normal">조회수가 급상승하고 있는 대회를 놓치지 마세요.</p>
            </div>
            <button 
                onClick={() => router.push('/tournaments')}
                className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-[#3182F6] transition-colors"
            >
                전체보기 <ArrowRight size={16}/>
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-[320px] bg-slate-100 rounded-3xl animate-pulse"/>)
            ) : hotTournaments.map((t) => (
                <div 
                    key={t.id} 
                    onClick={() => router.push(`/tournaments/${t.id}`)}
                    className="group cursor-pointer flex flex-col gap-3"
                >
                    <div className="relative aspect-[4/5] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:-translate-y-2">
                        {/* ✅ DB 컬럼명 매칭: t.poster_url -> t.image_url */}
                        {t.image_url ? (
                            <img src={t.image_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">🎾</div>
                        )}
                        <div className="absolute top-4 left-4">
                             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold shadow-sm backdrop-blur-md text-white
                               ${t.status === '접수중' ? 'bg-[#3182F6]/90' : 'bg-slate-800/80'}`}>
                               {t.status}
                             </span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900 leading-snug group-hover:text-[#3182F6] transition-colors line-clamp-1">{t.title}</h3>
                        {/* ✅ DB 컬럼명 매칭: t.start_date -> t.date */}
                        <p className="text-sm text-slate-500 mt-1 font-normal">{t.location} · {t.date}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 4. Why CHIDA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">왜 <span className="text-[#3182F6]">치다</span>인가요?</h2>
                <p className="text-slate-500 font-normal">테니스인들이 가장 불편해하는 점들을 해결했습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard icon={<Sparkles size={28} />} title="전국 대회 통합 검색" desc="KATA, KATO, 로컬 대회까지. 흩어져 있는 정보를 한곳에서 쉽고 빠르게 찾으세요." color="blue" />
                <FeatureCard icon={<CheckCircle2 size={28} />} title="스마트한 필터링" desc="내 실력(구력)과 지역에 딱 맞는 대회만 골라보세요. 불필요한 정보는 뺍니다." color="green" />
                <FeatureCard icon={<ShieldCheck size={28} />} title="검증된 정보 제공" desc="취소되거나 변경된 대회 정보도 빠르게 업데이트하여 헛걸음하지 않게 돕습니다." color="purple" />
            </div>
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section className="w-full bg-black py-32 px-5 relative overflow-hidden mb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#3182F6] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left flex-1">
                <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
                    이제, 코트 위에서<br/>
                    <span className="text-[#3182F6]">증명할 시간</span>입니다.
                </h2>
                <p className="text-slate-400 text-lg mb-10 font-light max-w-lg mx-auto md:mx-0">
                    망설이지 마세요. 당신을 기다리는 수많은 대회가 여기 있습니다.
                    지금 바로 도전하세요.
                </p>
                <button 
                    onClick={() => router.push('/tournaments')}
                    className="px-10 py-5 bg-[#3182F6] text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all shadow-[0_0_40px_rgba(49,130,246,0.4)] hover:-translate-y-1 ring-2 ring-blue-500/30"
                >
                    대회 전체 리스트 보기
                </button>
            </div>
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center animate-float-slow">
                 <CssTrophy size={280} />
                 <div className="absolute top-0 right-10 animate-pulse-slow"><CssStar size={40} /></div>
                 <div className="absolute bottom-10 left-0 animate-pulse-slow delay-700"><CssStar size={30} /></div>
            </div>
        </div>
      </section>

      {/* 6. Footer (Final Complete: Larger Font & Tight Line) */}
      <footer className="bg-white pb-20 mt-auto">
        <div className="max-w-7xl mx-auto px-5">
            
            {/* 구분선 */}
            <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                
                {/* 왼쪽: 회사 정보 */}
                <div className="text-left space-y-2">
                    <p className="text-[#65676A] font-medium text-base">© 2026 Chida Corp.</p>
                    
                    <div className="flex flex-col gap-1 text-base text-[#A7A7AA] font-normal">
                        <div className="flex flex-wrap items-center gap-2">
                            <span>주식회사 치다</span>
                            <span className="w-px h-3 bg-slate-300 hidden sm:block"></span>
                            <span>대표자 : 박영승</span>
                        </div>
                        <p>사업자등록번호 : 000-00-00000</p>
                    </div>
                </div>

                {/* 오른쪽: 소셜 아이콘 */}
                <div className="flex gap-3">
                    <SocialIcon href="https://facebook.com" icon={<Facebook size={20} />} />
                    <SocialIcon href="https://youtube.com" icon={<Youtube size={20} />} />
                    <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} />
                </div>

            </div>
        </div>
      </footer>

    </div>
  );
}

// ✨ Footer용 소셜 아이콘 컴포넌트
function SocialIcon({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#A7A7AA] hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
            {icon}
        </a>
    )
}

// 🏆 3D Trophy Component (유지)
function CssTrophy({ size }: { size: number }) {
    return (
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
             <div className="relative z-20 w-[60%] h-[55%] bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-b-[40%] rounded-t-[5%] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.2),inset_10px_10px_30px_rgba(255,255,255,0.6)] flex items-center justify-center overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-white opacity-20 rotate-45 pointer-events-none blur-xl"></div>
                <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-white rounded-full opacity-40 blur-lg"></div>
             </div>
             <div className="absolute top-[15%] left-[10%] w-[80%] h-[35%] z-10">
                <div className="absolute left-0 top-0 w-[20%] h-full border-[12px] border-yellow-500 rounded-l-[2rem] shadow-lg"></div>
                <div className="absolute right-0 top-0 w-[20%] h-full border-[12px] border-yellow-500 rounded-r-[2rem] shadow-lg"></div>
             </div>
             <div className="absolute bottom-[10%] w-[40%] h-[15%] flex flex-col items-center justify-end z-10">
                 <div className="w-[40%] h-[60%] bg-yellow-600"></div>
                 <div className="w-full h-[40%] bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-t-lg shadow-xl"></div>
             </div>
             <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-[60px] rounded-full z-0"></div>
        </div>
    )
}

// ✨ Star Component
function CssStar({ size }: { size: number }) {
    return (
        <div style={{ width: size, height: size }} className="bg-gradient-to-b from-yellow-100 to-yellow-300 transform rotate-45 rounded-sm shadow-[0_0_15px_rgba(255,255,0,0.6)]"></div>
    )
}

// 🎾 Tennis Ball (유지)
function CssTennisBall({ size }: { size: number }) {
  return (
    <div 
      style={{ width: size, height: size }}
      className="rounded-full bg-[#E8F664] relative shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.15),inset_10px_10px_30px_rgba(255,255,255,0.8),0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute w-full h-full border-[6px] border-white rounded-full opacity-80" style={{ transform: 'scale(1.5) rotate(45deg)', borderRadius: '50%' }}></div>
      <div className="absolute w-[90%] h-[90%] border-[6px] border-white rounded-full opacity-80" style={{ top: '-45%', left: '-45%' }}></div>
      <div className="absolute w-[90%] h-[90%] border-[6px] border-white rounded-full opacity-80" style={{ bottom: '-45%', right: '-45%' }}></div>
      <div className="absolute top-[15%] left-[15%] w-[20%] h-[20%] bg-white rounded-full blur-md opacity-60"></div>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{value}</span>
            <span className="text-sm font-medium text-slate-400">{label}</span>
        </div>
    )
}

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: 'blue' | 'green' | 'purple';
};

function FeatureCard({ icon, title, desc, color }: FeatureCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-[#3182F6]',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-normal">{desc}</p>
        </div>
    );
}