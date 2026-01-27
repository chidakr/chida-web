'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Trophy, ArrowRight, Activity, Calendar } from 'lucide-react';

type Profile = {
  nickname: string;
  ntrp: string;
  years: string;
  avatar_url?: string;
};

export default function MyPageHome() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentApps, setRecentApps] = useState<import('@/types').Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 프로필 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. 최근 신청한 대회 2개만 가져오기
      const { data: appsData } = await supabase
        .from('participants')
        .select(`
          *,
          tournaments (title, date, location)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      setProfile(profileData);
      setRecentApps(appsData || []);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) return <div className="py-20 text-center text-slate-400">데이터 로딩중...</div>;

  return (
    <div className="space-y-8">
      
      {/* 1. 상단 웰컴 배너 (웹 스타일) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="profile" fill className="object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎾</div>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                    반가워요, {profile?.nickname || '플레이어'}님!
                </h2>
                <p className="text-slate-500 font-medium">
                    오늘도 코트 위에서 멋진 플레이 기대할게요 🔥
                </p>
            </div>
        </div>
        <Link 
            href="/my-card" 
            className="hidden md:flex items-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
            내 선수 카드 <ArrowRight size={18}/>
        </Link>
      </div>

      {/* 2. 대시보드 그리드 (좌우 배치) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 왼쪽: 내 스탯 요약 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-500"/> 내 스탯
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-400 mb-1">NTRP</p>
                    <p className="text-2xl font-black text-slate-800">{profile?.ntrp}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-400 mb-1">구력</p>
                    <p className="text-2xl font-black text-slate-800">{profile?.years}년</p>
                </div>
            </div>
        </div>

        {/* 오른쪽: 최근 신청 내역 (프리뷰) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={20} className="text-green-500"/> 최근 신청
                </h3>
                <Link href="/mypage/applications" className="text-xs font-bold text-slate-400 hover:text-blue-500">
                    전체보기
                </Link>
            </div>
            
            <div className="flex-1 space-y-3">
                {recentApps.length > 0 ? (
                    recentApps.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Trophy size={16} className="text-blue-500"/>
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{item.tournaments.title}</p>
                                <p className="text-xs text-slate-500">{item.tournaments.date} · {item.tournaments.location}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-4">
                        <p>신청 내역이 없습니다</p>
                        <Link href="/tournaments" className="mt-2 text-blue-500 font-bold text-xs underline">
                            대회 찾아보기
                        </Link>
                    </div>
                )}
            </div>
        </div>

      </div>

    </div>
  );
}