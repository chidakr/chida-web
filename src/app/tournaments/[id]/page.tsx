'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { Tournament } from '@/types';
import {
  ChevronLeft, Calendar, MapPin, Users, Share2, Bookmark, Trophy,
  CheckCircle2, Clock, ExternalLink, AlertCircle, Copy, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookmarkButton } from '@/components/tournaments';

// Mock Data (테스트용) - 유효한 UUID 사용
const MOCK_TOURNAMENT = {
  id: '00000000-0000-0000-0000-000000000001',
  title: "제5회 Kim's 전국동호인테니스대회",
  status: 'recruiting',
  date: '2026-03-07',
  location: '경북대학교 테니스장',
  category: '일반',
  max_participants: 32,
  current_participants: 8,
  thumbnail_url: '/images/kato-groupa.png',
  registration_link: '',
  description: '전국 동호인 테니스 대회를 개최합니다.',
  divisions: ['개나리부', '국화부', '챌린저부', '마스터스부'],
  prizes: [
    { rank: '우승 (1위)', reward: '상금 100만원 + 상패' },
    { rank: '준우승 (2위)', reward: '상금 60만원 + 상패' },
    { rank: '3위', reward: '상금 40만원 + 상패' }
  ],
  schedule: [
    { date: '2026.03.07 (토)', division: '개나리부 / 국화부', time: '오전 09:00' },
    { date: '2026.03.08 (일)', division: '챌린저부 / 마스터스부', time: '오전 09:00' }
  ],
  account: '국민은행 000-000-000000',
  accountHolder: '김테니스'
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchTournament() {
      if (!id) return;

      const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();

      if (error || !data) {
        console.log('⚠️ DB에 데이터가 없어 Mock Data를 사용합니다');
        setTournament(MOCK_TOURNAMENT);
      } else {
        // JSON 문자열로 저장된 필드들을 파싱
        const parsedData = {
          ...data,
          divisions: typeof data.divisions === 'string' ? JSON.parse(data.divisions) : data.divisions,
          prizes: typeof data.prizes === 'string' ? JSON.parse(data.prizes) : data.prizes,
          schedule: typeof data.schedule === 'string' ? JSON.parse(data.schedule) : data.schedule,
        };
        setTournament(parsedData);
      }

      setLoading(false);
    }
    fetchTournament();
  }, [id, router, supabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
  };

  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dDay < 0 ? '종료' : (dDay === 0 ? '오늘마감' : `D-${dDay}`);
  };

  // 🔥 추가: 참가비 포맷팅 함수
  const formatFee = (fee: number | null | undefined) => {
    if (!fee || fee === 0) {
      return '문의';
    }
    return `${Number(fee).toLocaleString()}원`;
  };

  const handleCopyAccount = () => {
    if (tournament?.account) {
      navigator.clipboard.writeText(tournament.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm tracking-tight">대회 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!tournament) return null;

  const dDay = getDday(tournament.date);
  const isRecruiting = tournament.status === 'recruiting';

  // 🔥 추가: 참가비 포맷
  const formattedFee = formatFee(tournament.fee);

  // 🔥 상태 배지 텍스트
  const getStatusText = () => {
    switch (tournament.status) {
      case 'recruiting':
        return '🔥 접수중';
      case 'upcoming':
        return '⏰ 대회준비중';
      case 'closed':
        return '마감';
      default:
        return '마감';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Link href="/tournaments" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm transition-colors tracking-tight">
            <ChevronLeft size={16}/> 대회 목록
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 relative">
          
          {/* [LEFT] 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            
            {/* 1. Division 태그 */}
            {tournament.divisions && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tournament.divisions.map((div: string) => (
                  <Badge key={div} variant="secondary" className="text-xs px-2.5 py-1 tracking-tight">
                    #{div}
                  </Badge>
                ))}
              </div>
            )}

            {/* 2. 배너 이미지 */}
            <div className="relative w-full aspect-[21/9] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden mb-6 border border-slate-100 group hover:shadow-md transition-all duration-300">
              {(tournament.thumbnail_url || tournament.image_url) ? (
                <Image 
                  src={tournament.thumbnail_url || tournament.image_url || ''} 
                  alt={tournament.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <Trophy size={64} className="opacity-20" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-yellow-400 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm tracking-tight">
                  EVENT
                </span>
              </div>
            </div>

            {/* 3. 타이틀 */}
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mb-4 break-keep tracking-tight">
              {tournament.title}
            </h1>

            {/* 4. 메타 정보 */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5 tracking-tight">
                <Calendar size={15} className="text-slate-400"/>
                <span>{formatDate(tournament.date)}</span>
              </div>
              <Separator orientation="vertical" className="h-3"/>
              <div className="flex items-center gap-1.5 tracking-tight">
                <MapPin size={15} className="text-slate-400"/>
                <span>{tournament.location_detail || tournament.location}</span>
              </div>
              <Separator orientation="vertical" className="h-3"/>
              <div className="flex items-center gap-1.5 tracking-tight">
                <Users size={15} className="text-slate-400"/>
                <span>{tournament.max_participants}팀 모집</span>
              </div>
            </div>

            <Separator className="my-6"/>

            {/* 5. Tabs */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm pt-3 pb-3 -mx-6 px-6 mb-4 border-b border-slate-100">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start bg-transparent border-0 p-0 h-auto gap-6">
                  <TabsTrigger value="overview" className="text-sm font-medium px-0 pb-2 tracking-tight data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                    📋 대회요강
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-sm font-medium px-0 pb-2 tracking-tight data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                    📅 일정/장소
                  </TabsTrigger>
                  <TabsTrigger value="prize" className="text-sm font-medium px-0 pb-2 tracking-tight data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                    🏆 상금/혜택
                  </TabsTrigger>
                  <TabsTrigger value="notice" className="text-sm font-medium px-0 pb-2 tracking-tight data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                    🚨 유의사항
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold tracking-tight">대회 개요</CardTitle>
                    <CardDescription className="tracking-tight">이 대회의 핵심 정보를 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoItem label="대회명" value={tournament.title} />
                      <InfoItem label="모집 인원" value={`${tournament.max_participants}팀`} />
                      <InfoItem label="참가 부문" value={tournament.divisions?.join(', ') || '-'} />
                      <InfoItem label="참가비" value={formattedFee} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">상세 모집 요강</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap tracking-tight">
                      {tournament.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">대회 규정 및 세부사항</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="rule-1" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-medium tracking-tight hover:no-underline">경기 방식 및 규칙</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600 leading-relaxed tracking-tight">
                          • 복식 경기 (2인 1팀)<br/>
                          • 토너먼트 방식 진행<br/>
                          • ITF 공인구 사용<br/>
                          • 세트당 6게임 선취 (타이브레이크 적용)
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="rule-2" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-medium tracking-tight hover:no-underline">참가 자격</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600 leading-relaxed tracking-tight">
                          • 만 19세 이상 테니스 동호인<br/>
                          • 부문별 레벨 제한 있음<br/>
                          • 프로 선수 참가 불가
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="rule-3" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-medium tracking-tight hover:no-underline">환불 규정</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600 leading-relaxed tracking-tight">
                          • 대회 7일 전: 100% 환불<br/>
                          • 대회 3~6일 전: 50% 환불<br/>
                          • 대회 2일 전~당일: 환불 불가
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-5">
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold tracking-tight">대회 일정</CardTitle>
                    <CardDescription className="tracking-tight">부문별 경기 일정을 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tournament.schedule?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 relative">
                          {idx !== tournament.schedule.length - 1 && (
                            <div className="absolute left-[16px] top-10 w-0.5 h-full bg-slate-100"></div>
                          )}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 shrink-0 z-10">
                            <Calendar size={16}/>
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="text-sm font-medium text-slate-900 mb-0.5 tracking-tight">{item.date}</p>
                              <p className="text-sm text-slate-600 tracking-tight">{item.division}</p>
                              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 tracking-tight">
                                <Clock size={13}/> {item.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">대회 장소</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18}/>
                      <div>
                        <p className="font-medium text-slate-900 mb-0.5 tracking-tight">{tournament.location_detail || tournament.location}</p>
                        {tournament.location && tournament.location_detail && (
                          <p className="text-sm text-slate-500 tracking-tight">{tournament.location}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'prize' && (
              <div className="space-y-5">
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold tracking-tight">시상 내역</CardTitle>
                    <CardDescription className="tracking-tight">부문별 우승 팀에게 드리는 혜택입니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {tournament.prizes?.map((prize: any, idx: number) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl p-4 text-center border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            idx === 0
                              ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                              : idx === 1
                              ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
                              : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                          }`}
                        >
                          <div className="text-3xl mb-2">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </div>
                          <p className="text-base font-semibold text-slate-900 mb-1 tracking-tight">{prize.rank}</p>
                          <p className="text-sm text-slate-600 tracking-tight">{prize.reward}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">입금 계좌</CardTitle>
                    <CardDescription className="tracking-tight">참가비를 아래 계좌로 입금해주세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 mb-1 tracking-tight">계좌번호</p>
                          <p className="text-lg font-medium text-slate-900 tracking-tight">{tournament.account}</p>
                          <p className="text-sm text-slate-600 mt-1 tracking-tight">예금주: {tournament.accountHolder}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAccount}
                          className="shrink-0 active:scale-95 transition-transform border-slate-200"
                        >
                          {copied ? (
                            <>
                              <Check size={14} className="mr-1"/> 복사됨
                            </>
                          ) : (
                            <>
                              <Copy size={14} className="mr-1"/> 복사
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notice' && (
              <div className="space-y-5">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18}/>
                    <div>
                      <h3 className="font-medium text-red-900 mb-1.5 tracking-tight">필수 확인 사항</h3>
                      <ul className="text-sm text-red-800 space-y-1 tracking-tight">
                        <li>• 신분증을 필수로 지참해주세요 (미지참 시 참가 불가)</li>
                        <li>• 부정선수 적발 시 즉시 실격 처리됩니다</li>
                        <li>• 기상 악화 시 대회가 연기될 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">참가 전 안내사항</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-slate-600 leading-relaxed space-y-1.5 tracking-tight">
                      <li>• 대회 시작 30분 전까지 현장 접수를 완료해주세요</li>
                      <li>• 개인 라켓 및 운동화는 필수 지참사항입니다</li>
                      <li>• 주차 공간이 제한적이니 대중교통을 이용해주세요</li>
                      <li>• 대회 중 발생한 부상에 대해서는 주최측이 책임지지 않습니다</li>
                      <li>• 응급 상황 발생 시 즉시 스태프에게 알려주세요</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold tracking-tight">문의처</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2 tracking-tight">
                        <span className="text-slate-500 w-20">전화</span>
                        <span className="text-slate-900 font-medium">010-2227-1731</span>
                      </div>
                      <div className="flex items-center gap-2 tracking-tight">
                        <span className="text-slate-500 w-20">지도자부</span>
                        <span className="text-slate-900 font-medium">010-5800-8635</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>

          {/* [RIGHT] Sidebar */}
          <div className="lg:w-[380px] shrink-0 hidden lg:block">
            <div className="sticky top-20">
              <Card className="shadow-md border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={isRecruiting ? "default" : "secondary"} className="text-xs font-medium tracking-tight">
                      {getStatusText()}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium text-blue-600 tracking-tight">
                      {dDay}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight line-clamp-2 tracking-tight">
                    {tournament.title}
                  </CardTitle>
                </CardHeader>

                <Separator/>

                <CardContent className="pt-5 space-y-5">
                  <div className="space-y-2.5">
                    <SidebarInfoRow icon={<Calendar size={15}/>} label="대회일정" value={formatDate(tournament.date)} />
                    <SidebarInfoRow icon={<MapPin size={15}/>} label="장소" value={tournament.location_detail || tournament.location} />
                    <SidebarInfoRow icon={<Users size={15}/>} label="모집 팀 수" value={`${tournament.max_participants}팀`} />
                    <SidebarInfoRow icon={<Trophy size={15}/>} label="참가비" value={formattedFee} />
                  </div>

                  <Separator/>

                  <div className="mb-5">
                    {tournament.registration_link ? (
                      <Link href={tournament.registration_link} target="_blank">
                        <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-sm text-white tracking-tight active:scale-95 transition-transform">
                          신청페이지 바로가기
                          <ExternalLink size={16} className="ml-1.5"/>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled={!isRecruiting}
                        className={`w-full h-12 text-base font-semibold shadow-sm tracking-tight active:scale-95 transition-transform ${
                          isRecruiting
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isRecruiting ? '참가 신청하기' : '마감되었습니다'}
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2.5 w-full">
                    <div className="flex-1">
                      <BookmarkButton tournamentId={tournament.id} variant="outline" />
                    </div>
                    <div className="flex-1">
                      <Button variant="outline" className="w-full h-10 font-medium text-sm tracking-tight border-slate-200 active:scale-95 transition-transform">
                        <Share2 size={15} className="mr-1"/> 공유
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Badge className="bg-blue-600 text-white text-xs font-medium tracking-tight">EVENT</Badge>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed tracking-tight">
                      🎾 대회 참가 후기 남기면<br/>
                      <span className="text-blue-700 font-medium">1,000 포인트</span> 드려요!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>

        {/* Mobile Bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-50 shadow-lg">
          {tournament.registration_link ? (
            <Link href={tournament.registration_link} target="_blank">
              <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white tracking-tight active:scale-95 transition-transform">
                신청페이지 바로가기
              </Button>
            </Link>
          ) : (
            <Button
              disabled={!isRecruiting}
              className={`w-full h-12 text-base font-semibold tracking-tight active:scale-95 transition-transform ${
                isRecruiting
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {isRecruiting ? '참가 신청하기' : '마감'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5 tracking-tight">{label}</p>
      <p className="text-sm font-medium text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function SidebarInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5 tracking-tight">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate tracking-tight">{value}</p>
      </div>
    </div>
  );
}
