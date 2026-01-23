'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/src/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, Quote } from 'lucide-react';

// 프로필 타입 정의
type Profile = {
  full_name: string;
  ntrp: string;
  years: string;
  style: string;
  motto: string;
};

export default function MyCardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      // 1. 현재 로그인한 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login'); // 로그인 안했으면 쫓아냄
        return;
      }

      // 2. DB에서 프로필 정보 가져오기
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error('프로필 로딩 실패:', error);
        // 프로필 없으면 설정 페이지로 보냄
        router.replace('/profile/setup');
      } else {
        setProfile({
          full_name: data.full_name || '익명 플레이어', // 카카오 이름이 없을 경우 대비
          ntrp: data.ntrp || 'Unrated',
          years: data.years || '0',
          style: data.style || '올라운더',
          motto: data.motto || '테니스가 좋아요',
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router, supabase]);

  const handleShare = () => {
    alert('📸 캡처해서 인스타그램에 자랑해보세요!');
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">카드 발급중...</div>;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans flex flex-col">
      {/* 배경 데코레이션 */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 헤더 */}
      <header className="relative z-20 flex items-center p-5">
        <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center font-bold text-lg mr-10 opacity-80">PLAYER ID</h1>
      </header>

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
        
        {/* 카드 본체 */}
        <div className="group relative w-full max-w-[340px] aspect-[3/5] transition-all duration-500 hover:scale-[1.02]">
            {/* 홀로그램 효과 */}
            <div className="absolute -inset-[3px] bg-gradient-to-br from-[#3182F6] via-purple-500 to-[#FF0080] rounded-[2.5rem] opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>
            
            <div className="relative h-full bg-[#111] rounded-[2.3rem] overflow-hidden border border-white/10 flex flex-col">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                {/* 3D 테니스 공 */}
            <div className="absolute -right-16 -top-10 w-48 h-48 animate-float-slow">
              <Image 
                src="https://cdn3d.iconscout.com/3d/premium/thumb/tennis-ball-5379590-4497552.png" 
                alt="3d ball" 
                fill // 부모 박스 크기에 맞춰 꽉 채움
                className="object-cover opacity-90 mix-blend-hard-light"
                priority // ⭐ 중요: 화면 뜨자마자 로딩하라고 우선순위 줌
              />
            </div>

                {/* 상단 */}
                <div className="p-8 pt-10">
                    <div className="flex justify-between items-start">
                        <span className="font-black text-2xl tracking-tighter italic">CHIDA</span>
                        <div className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-bold tracking-widest text-slate-300">
                            OFFICIAL
                        </div>
                    </div>
                </div>

                {/* 중단: 유저 데이터 바인딩 */}
                <div className="flex-1 flex flex-col justify-center items-center text-center px-6 relative z-10">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-slate-700 to-black p-[2px] mb-6 shadow-2xl shadow-blue-900/40">
                         <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                             {/* 이니셜 (이름 앞 2글자) */}
                             <span className="text-4xl font-black text-slate-600 uppercase">
                                {profile.full_name.slice(0, 2)}
                             </span>
                         </div>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2">{profile.full_name}</h2>
                    <p className="text-blue-400 text-sm font-bold tracking-wide mb-8 uppercase">{profile.style}</p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <StatBox label="NTRP" value={profile.ntrp} color="text-yellow-400" />
                        <StatBox label="EXPERIENCE" value={`${profile.years} Yrs`} color="text-blue-400" />
                    </div>
                </div>

                {/* 하단: 각오 */}
                <div className="p-6 pb-8 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center gap-2 mb-6 justify-center opacity-70">
                        <Quote size={12} className="rotate-180"/>
                        <p className="text-xs font-medium text-slate-300">"{profile.motto}"</p>
                        <Quote size={12}/>
                    </div>
                    <div className="h-8 w-full opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Code128b.svg/1280px-Code128b.svg.png')] bg-repeat-x bg-contain filter invert"></div>
                </div>
            </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-10 w-full max-w-[340px] space-y-3">
             <button 
                onClick={handleShare}
                className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
             >
                <Share2 size={20} />
                이미지 저장하기
             </button>
        </div>

      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">{label}</span>
            <span className={`text-xl font-black ${color} italic`}>{value}</span>
        </div>
    )
}