'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  ChevronLeft, Calendar, MapPin, Share2, Trophy,
  Clock, Phone, AlertCircle, Copy, Check, CreditCard,
  Siren, ExternalLink, Info, Youtube, Building2, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookmarkButton } from '@/components/tournaments';
import Footer from '@/components/layout/Footer';
import { parseLocation } from '@/lib/utils';

// ----------------------------------------------------------------------
// [UTILS] 날짜 및 포맷팅
// ----------------------------------------------------------------------
const formatDate = (dateString: string) => {
  if (!dateString) return '미정';
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
};

const getDday = (dateString: string) => {
  if (!dateString) return '';
  const today = new Date();
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return dDay < 0 ? '종료' : (dDay === 0 ? '오늘마감' : `D-${dDay}`);
};

const formatFee = (fee: number | null | undefined) => {
  if (!fee || fee === 0) return '문의';
  return `${Number(fee).toLocaleString()}`;
};

// 🔥 [DATA] 보내주신 리얼 데이터 하드코딩 (DB 연동 전 시각화용)
const REAL_DATA = {
  host: "Kim's Tennis, (사)한국테니스발전협의회",
  sponsor: "경상북도테니스협회, 대구광역시북구테니스협회, 포항시테니스협회, 청도군테니스협회, Team GA-STAR, 늘시원한위대항병원, 대영이엔지, 우드림, 삼겹길",
  ball: "낫소 짜르투어테니스볼",
  refund: "2026년 2월 27일(금) 15시 마감. 이후 환불불가",
  live: "테니스라이브 YouTube 실시간 중계 (4일간)",
  accounts: [
    { name: "개나리부", bank: "국민은행", number: "028202-04-083663", owner: "김경섭" },
    { name: "지도자부", bank: "카카오뱅크", number: "3333-25-4640407", owner: "김경섭" },
    { name: "국화부", bank: "기업은행", number: "545-005715-01-026", owner: "김경섭" },
    { name: "혼합복식부", bank: "국민은행", number: "028202-04-083663", owner: "김경섭" },
    { name: "마스터스부", bank: "기업은행", number: "545-005715-01-026", owner: "김경섭" },
    { name: "부부", bank: "카카오뱅크", number: "3333-25-4640407", owner: "김경섭" },
    { name: "챌린저부", bank: "기업은행", number: "545-005715-01-033", owner: "김경섭" },
  ],
  contacts: [
    { role: "전부서", name: "김경섭", phone: "010-2227-1731" },
    { role: "지도자부", name: "이준석", phone: "010-5800-8635" },
    { role: "참가자격문의", name: "KATO사무국", phone: "02-401-7979" },
  ]
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null); // 복사된 계좌번호 추적
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchTournament() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select(`
            *,
            tournament_divisions (
              id,
              name,
              date_start,
              time_start,
              fee,
              capacity,
              current_participants,
              status,
              description,
              location,
              account_bank,
              account_number,
              account_owner
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('❌ Supabase 쿼리 에러:', JSON.stringify(error, null, 2));
          console.error('   에러 코드:', error.code);
          console.error('   에러 메시지:', error.message);
          console.error('   요청한 ID:', id);
        } else {
          console.log('✅ 대회 데이터 로드 완료');
          console.log('📊 Tournament:', {
            id: data?.id,
            title: data?.title,
            divisions_count: data?.tournament_divisions?.length || 0
          });

          // 부서별 일정 상세 로그
          if (data?.tournament_divisions && Array.isArray(data.tournament_divisions)) {
            console.log('📋 부서별 일정:');
            data.tournament_divisions.forEach((div: any, idx: number) => {
              console.log(`   [${idx + 1}] ${div.name} | ${div.date_start} | ${div.time_start || '09:00'}`);
            });
          } else {
            console.warn('⚠️ tournament_divisions가 비어있거나 배열이 아닙니다.');
          }

          setTournament(data);
        }
      } catch (err) {
        console.error('❌ 예외 발생:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTournament();
  }, [id, supabase]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    } catch (err) {
      console.error('공유 실패', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  if (!tournament) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <p className="text-slate-500 font-medium">대회 정보를 찾을 수 없습니다.</p>
      <Button variant="outline" onClick={() => router.back()}>뒤로 가기</Button>
    </div>
  );

  const dDay = getDday(tournament.date);
  const isRecruiting = tournament.status === 'recruiting';
  const isUpcoming = tournament.status === 'upcoming';
  const isClosed = !isRecruiting && !isUpcoming;
  const divisions = Array.isArray(tournament.tournament_divisions) ? tournament.tournament_divisions : [];
  const minFee = divisions.length > 0
    ? Math.min(...divisions.map((d: any) => d.fee).filter((f: number) => f > 0))
    : tournament.fee;

  const { region, detail } = parseLocation(tournament.location, tournament.location_detail);

  // 🔥 부서별 계좌 정보 추출 (tournament_divisions에서)
  const divisionAccounts = divisions
    .filter((div: any) => div.account_number && div.account_bank)
    .map((div: any) => ({
      name: div.name,
      bank: div.account_bank,
      number: div.account_number,
      owner: div.account_owner || div.account_holder || ''
    }));

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0 font-sans text-slate-900">
      
      {/* 1. Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 h-12 flex items-center justify-between md:hidden">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-slate-900 truncate max-w-[200px] text-sm">{tournament.title}</h1>
        <button onClick={handleShare} className="p-2 -mr-2 text-slate-800">
          <Share2 size={20} />
        </button>
      </header>

      {/* PC Header */}
      <div className="hidden md:block border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
           <Link href="/tournaments" className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
             <ChevronLeft size={18} /> 목록으로
           </Link>
           <div className="flex items-center gap-1">
             <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-500 hover:bg-slate-50 h-9">
                <Share2 size={18} className="mr-1.5"/> 공유
             </Button>
           </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto md:py-10 px-0 md:px-6">
        <div className="flex flex-col lg:flex-row gap-10 relative">
          
          {/* [LEFT] 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            
            {/* 2. Hero Section */}
            <div className="bg-white md:rounded-2xl overflow-hidden mb-8">
              <div className="relative aspect-video md:aspect-[21/9] bg-slate-50 group md:rounded-2xl overflow-hidden border border-slate-100">
                 {(tournament.thumbnail_url || tournament.image_url) ? (
                   <Image 
                     src={tournament.thumbnail_url || tournament.image_url} 
                     alt={tournament.title} 
                     fill 
                     className="object-cover transition-transform duration-700 group-hover:scale-105"
                     unoptimized
                   />
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                      <Trophy size={48} className="mb-2 opacity-10" />
                   </div>
                 )}
                 
                 {/* 🔥 [UI FIX] 상세페이지 배지 - TournamentCard와 동일 디자인 (화이트 배경) */}
                 <div className="absolute top-4 left-4 flex gap-2">
                    {/* 모집중 */}
                    {isRecruiting && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-sm backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                        <span className="text-xs font-bold text-slate-800 tracking-tight">접수중</span>
                      </div>
                    )}
                    
                    {/* 준비중: 배경 화이트로 통일 */}
                    {isUpcoming && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-sm backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-xs font-bold text-slate-800 tracking-tight">대회준비중</span>
                      </div>
                    )}

                    {/* 마감 */}
                    {isClosed && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-sm backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="text-xs font-medium text-slate-500 tracking-tight">마감</span>
                      </div>
                    )}

                    {/* D-Day */}
                    {isRecruiting && dDay && (
                      <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 border border-blue-100 text-blue-600 shadow-sm backdrop-blur-sm">
                        {dDay}
                      </div>
                    )}
                 </div>
              </div>

              <div className="px-4 md:px-0 pt-6">
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {divisions.map((div: any) => (
                        <span key={div.id} className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          #{div.name}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-3 break-keep tracking-tight">
                        {tournament.title}
                    </h1>
                    
                    {/* 주최/후원사 정보 */}
                    <div className="space-y-1 text-sm text-slate-500">
                       <p className="flex items-start gap-2">
                          <span className="font-bold text-slate-700 shrink-0">주최/주관</span> 
                          {REAL_DATA.host}
                       </p>
                       <p className="flex items-start gap-2">
                          <span className="font-bold text-slate-700 shrink-0">후원</span> 
                          <span className="line-clamp-1">{REAL_DATA.sponsor}</span>
                       </p>
                    </div>
                </div>

                <Separator className="my-6 bg-slate-100" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <div className="flex items-start gap-3">
                        <Calendar className="text-slate-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">대회 기간</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{formatDate(tournament.date)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="text-slate-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">장소</p>
                            <p className="text-sm font-bold text-slate-900 break-keep leading-snug tracking-tight">
                                {region}
                            </p>
                            {detail && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 break-keep leading-relaxed">
                                    {detail}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* 3. Tabs */}
            <Tabs defaultValue="overview" className="mt-10" value={activeTab} onValueChange={setActiveTab}>
              <div className="sticky top-12 md:top-14 z-30 bg-white pb-2 border-b border-slate-100">
                 <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-8">
                    {['overview', 'schedule', 'regulation', 'contact'].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab} 
                        className="rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-medium text-slate-500 hover:text-slate-800 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-colors bg-transparent shadow-none"
                      >
                        {tab === 'overview' && '대회 요강'}
                        {tab === 'schedule' && '일정/계좌'}
                        {tab === 'regulation' && '규정'}
                        {tab === 'contact' && '문의처'}
                      </TabsTrigger>
                    ))}
                 </TabsList>
              </div>

              <div className="pt-6 min-h-[400px]">
                
                {/* [TAB 1] Overview */}
                <TabsContent value="overview" className="space-y-8 px-4 md:px-0 mt-0">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Info size={16} className="text-blue-500"/> 대회 요약
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                <span className="text-slate-500">라이브 중계</span>
                                <span className="text-slate-900 font-medium text-right flex items-center gap-1">
                                  <Youtube size={14} className="text-red-500"/> {REAL_DATA.live}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                <span className="text-slate-500">사용구</span>
                                <span className="text-slate-900 font-medium">{REAL_DATA.ball}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500">참가비</span>
                                <span className="text-blue-600 font-bold">{formatFee(minFee)}원 ~</span>
                            </div>
                        </div>
                    </div>

                    <section>
                         <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Trophy size={20} className="text-amber-500"/> 시상 내역
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {[{r: '🥇 우승', p: '상금 100만원'}, {r: '🥈 준우승', p: '상금 60만원'}, {r: '🥉 공동3위', p: '상금 40만원'}].map((item, idx) => (
                             <div key={idx} className="p-5 rounded-xl bg-white border border-slate-100 text-center shadow-sm">
                                <p className="text-sm font-bold text-slate-700 mb-1">{item.r}</p>
                                <p className="font-bold text-slate-900">{item.p}</p>
                             </div>
                           ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">* 70팀 미만 시 상금 삭감 조정, 150팀 이상 시 상향 조정</p>
                    </section>
                </TabsContent>

                {/* [TAB 2] Schedule & Accounts */}
                <TabsContent value="schedule" className="space-y-8 px-4 md:px-0 mt-0">
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-slate-400"/> 부서별 일정
                        </h3>
                        {divisions && divisions.length > 0 ? (
                            <div className="space-y-3">
                                {divisions.map((div: any, idx: number) => (
                                    <div key={div.id || idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-bold text-slate-900 text-base">{div.name || '미정'}</span>
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1.5">
                                                <Calendar size={14}/>
                                                <span className="font-medium">{div.date_start ? formatDate(div.date_start) : '미정'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="block text-xl font-bold text-slate-900 tracking-tight">
                                              {div.time_start?.substring(0,5) || '09:00'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-slate-400 font-medium mb-2">일정이 등록되지 않았습니다.</p>
                              <p className="text-xs text-slate-400">부서별 일정은 관리자가 등록한 후 표시됩니다.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-blue-500"/> 부서별 입금 계좌
                        </h3>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
                                <p className="text-xs text-slate-500 font-medium mb-1">팀당 참가비</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatFee(minFee)}<span className="text-lg font-normal text-slate-400 ml-1">원</span></p>
                                <p className="text-xs text-slate-400 mt-1">[팀당 4천원 꿈나무육성기금 포함]</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {divisionAccounts && divisionAccounts.length > 0 ? (
                                    divisionAccounts.map((acc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-0 px-1.5 py-0.5">{acc.name}</Badge>
                                                    {acc.owner && <span className="text-xs text-slate-400">{acc.owner}</span>}
                                                </div>
                                                <p className="text-sm text-slate-900 font-medium">
                                                    {acc.bank} <span className="font-bold">{acc.number}</span>
                                                </p>
                                            </div>
                                            <Button
                                                size="sm" variant="outline"
                                                onClick={() => handleCopy(acc.number, acc.number)}
                                                className="h-8 text-xs bg-white border-slate-200 text-slate-600"
                                            >
                                                {copied === acc.number ? <Check size={12} className="mr-1"/> : <Copy size={12} className="mr-1"/>}
                                                {copied === acc.number ? '완료' : '복사'}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-slate-50">
                                        <p className="text-slate-400 font-medium mb-1">계좌 정보가 등록되지 않았습니다.</p>
                                        <p className="text-xs text-slate-400">부서별 입금 계좌는 관리자가 등록한 후 표시됩니다.</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-rose-50 p-4 border-t border-rose-100">
                                <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                                    <AlertCircle size={14} /> 환불 마감: {REAL_DATA.refund}
                                </p>
                            </div>
                        </div>
                    </section>
                </TabsContent>

                {/* [TAB 3] Regulations (Accordion) */}
                <TabsContent value="regulation" className="space-y-6 px-4 md:px-0 mt-0">
                    <Card className="border-slate-200 shadow-sm">
                         <CardHeader className="py-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Siren size={18} className="text-rose-500"/> 상세 규정
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b border-slate-100">
                                    <AccordionTrigger className="px-6 py-4 font-bold text-slate-800 hover:no-underline hover:bg-slate-50">
                                        ◈ 부부 출전 규정
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-slate-600 leading-relaxed bg-slate-50/30">
                                        <ul className="list-disc pl-4 space-y-1 text-sm">
                                            <li>전국 부부 순수동호인 출전 가능</li>
                                            <li>전국부부시합 우승, 준우승 출전불가 (사랑부에 출전 가능)</li>
                                            <li>부부대회 80개팀 미만 입상자(우승자 포함) 출전 가능</li>
                                            <li>부부 증빙할 수 있는 서류 지참 필수</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-b border-slate-100">
                                    <AccordionTrigger className="px-6 py-4 font-bold text-slate-800 hover:no-underline hover:bg-slate-50">
                                        ◈ 지도자부 자격 및 규정
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-slate-600 leading-relaxed bg-slate-50/30">
                                        <p className="text-sm mb-2 font-bold text-slate-800">합산 7.0 이하 페어 구성</p>
                                        <ul className="list-disc pl-4 space-y-1 text-sm">
                                            <li>고등학교 선수출신 중 만50세 이상 (1점)</li>
                                            <li>대학선수출신 만 50세 이상 (2점)</li>
                                            <li>실업선수출신 만 50세 이상 (3점)</li>
                                            <li>*각 등급에서 만 2년 이내 우승자는 2점 상승</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-none">
                                    <AccordionTrigger className="px-6 py-4 font-bold text-slate-800 hover:no-underline hover:bg-slate-50">
                                        ◈ 혼합복식부 규정
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-slate-600 leading-relaxed bg-slate-50/30">
                                        <ul className="list-disc pl-4 space-y-1 text-sm">
                                            <li>마스터스 8점 이상 + 개나리부</li>
                                            <li>마스터스 7점 이하 + 국화부 비우승자</li>
                                            <li>전국 혼합복식 우승, 준우승경력자 간 파트너 분리출전</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* [TAB 4] Contact */}
                <TabsContent value="contact" className="space-y-6 px-4 md:px-0 mt-0">
                     <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Phone size={18} className="text-green-500"/> 문의처
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-4">
                            {REAL_DATA.contacts.map((contact, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">{contact.role}</span>
                                        <p className="text-base font-bold text-slate-900">{contact.name}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2 h-9 px-4" asChild>
                                        <a href={`tel:${contact.phone}`}>
                                            <Phone size={14}/> {contact.phone}
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                     <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={18} className="text-blue-500"/> 경기장 안내
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <MapPin className="text-slate-400 shrink-0 mt-1" size={20} />
                                <div>
                                    <p className="font-bold text-slate-900 text-lg leading-snug">
                                        {region}
                                    </p>
                                    {detail && (
                                        <p className="text-sm text-slate-500 mt-1 break-keep leading-relaxed">
                                            {detail}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="w-full h-56 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 text-sm border border-slate-100">
                                지도 API 연동 영역
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
              </div>
            </Tabs>

          </div>

          {/* ===================================== */}
          {/* [RIGHT] Sidebar (Desktop Sticky)      */}
          {/* ===================================== */}
          <div className="hidden lg:block w-[320px] shrink-0">
             <div className="sticky top-20 space-y-4">
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
                   <div className="p-6">
                      <div className="mb-6">
                         {/* 🔥 [UI FIX] 사이드바 배지 디자인 복원 (화이트 배경 + 점) */}
                         <div className="flex items-center gap-2 mb-2">
                            {/* 모집중 */}
                            {isRecruiting && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                                <span className="text-xs font-bold text-slate-800">접수중</span>
                              </span>
                            )}
                            {/* 준비중 (배경 화이트) */}
                            {isUpcoming && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                <span className="text-xs font-bold text-slate-800">대회준비중</span>
                              </span>
                            )}
                            {/* 마감 */}
                            {isClosed && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span className="text-xs font-medium text-slate-500">마감</span>
                              </span>
                            )}

                            {isRecruiting && dDay && (
                                <span className="text-sm font-bold text-blue-600 ml-auto">{dDay}</span>
                            )}
                         </div>
                         <h3 className="text-lg font-bold leading-snug break-keep text-slate-900">{tournament.title}</h3>
                      </div>

                      <Separator className="my-5 bg-slate-100" />

                      <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-start text-sm">
                            <span className="text-slate-500 shrink-0">일시</span>
                            <span className="text-slate-900 font-medium text-right">{formatDate(tournament.date)}</span>
                         </div>
                         <div className="flex justify-between items-start text-sm">
                            <span className="text-slate-500 shrink-0">장소</span>
                            <div className="text-right flex-1 pl-4">
                                <div className="text-slate-900 font-bold break-keep">
                                    {region}
                                </div>
                                {detail && (
                                    <div className="text-xs text-slate-500 mt-0.5 break-keep">
                                        {detail}
                                    </div>
                                )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         {tournament.registration_link ? (
                            <Button className="w-full h-12 text-base font-semibold bg-[#3182F6] hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200" asChild>
                               <a href={tournament.registration_link} target="_blank" rel="noopener noreferrer">
                                  접수하러 가기
                               </a>
                            </Button>
                         ) : (
                            <Button
                              disabled={!isRecruiting}
                              className={`w-full h-12 text-base font-semibold rounded-xl ${
                                isRecruiting ? 'bg-[#3182F6] hover:bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                               {isRecruiting ? '참가 신청하기' : isUpcoming ? '대회 준비중' : '접수 마감'}
                            </Button>
                         )}

                         <div className="flex gap-2.5">
                            <BookmarkButton
                              tournamentId={tournament.id}
                              variant="outline"
                              className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-xl"
                            />
                            <Button variant="outline" className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-xl gap-2 shadow-none" onClick={handleShare}>
                               <Share2 size={16} /> 공유
                            </Button>
                         </div>
                      </div>
                   </div>
                </Card>
                
                {/* 🔥 [RESTORED] 알림 배너 복구 완료 */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white shadow-xl shadow-violet-200">
                   <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm">📢 대회 알림 받기</p>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">NEW</Badge>
                   </div>
                   <p className="text-xs text-violet-100 leading-relaxed">원하는 대회가 열리면 가장 먼저 알려드려요! 놓치지 말고 신청하세요.</p>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* 4. Bottom Sticky Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden z-50 safe-area-bottom">
        <div className="flex gap-3">
            <div className="shrink-0">
               <BookmarkButton
                 tournamentId={tournament.id}
                 variant="default"
                 className="w-12 h-12 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
               />
            </div>
            {tournament.registration_link ? (
               <Button size="lg" className="flex-1 bg-[#3182F6] hover:bg-blue-600 text-white font-bold h-12 rounded-xl" asChild>
                  <a href={tournament.registration_link} target="_blank" rel="noopener noreferrer">
                     접수하러 가기
                  </a>
               </Button>
            ) : (
               <Button disabled={!isRecruiting} size="lg" className={`flex-1 font-bold h-12 rounded-xl ${isRecruiting ? 'bg-[#3182F6] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {isRecruiting ? '참가 신청' : isUpcoming ? '대회 준비중' : '마감'}
               </Button>
            )}
        </div>
      </div>

    </div>
  );
}