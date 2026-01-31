'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, Save, Plus, Trash2, Calendar, DollarSign, MapPin, CreditCard, User, Trophy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

// 부서(Division) 데이터 타입 정의
interface Division {
  id?: string;
  name: string;      
  date_start: string; 
  time_start: string; 
  location: string;   
  fee: number;        
  capacity: number;   
  account_bank: string; 
  account_number: string; 
  account_owner: string; 
}

export default function AdminWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. 기본 정보 State
  const [formData, setFormData] = useState({
    title: '',
    organizer: '', // 주최
    host: '',      // 주관
    sponsor: '',   // 후원
    game_ball: '', // 사용구
    refund_policy: '', // 환불규정
    location_city: '대구',
    location_detail: '',
    description: '', // 상세 규정
    registration_link: '',
    status: 'recruiting',
    date: new Date().toISOString().split('T')[0], // 대표 날짜
  });

  // 2. 부서(Division) 목록 State
  const [divisions, setDivisions] = useState<Division[]>([
    { name: '마스터스부', date_start: '', time_start: '09:00', location: '', fee: 54000, capacity: 60, account_bank: '기업은행', account_number: '', account_owner: '김경섭' }
  ]);

  // 초기 로딩 (수정 모드일 때)
  useEffect(() => {
    async function loadData() {
      if (!editId) return;
      setIsEditMode(true);
      setLoading(true);

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select(`*, tournament_divisions(*)`)
        .eq('id', editId)
        .single();

      if (error) {
        toast.error('대회 정보를 불러오는데 실패했습니다.');
        router.push('/admin');
        return;
      }

      setFormData({
        title: tournament.title || '',
        organizer: tournament.organizer || '',
        host: tournament.host || '',
        sponsor: tournament.sponsor || '',
        game_ball: tournament.game_ball || '',
        refund_policy: tournament.refund_policy || '',
        location_city: tournament.location_city || '대구',
        location_detail: tournament.location_detail || '',
        description: tournament.description || '',
        registration_link: tournament.registration_link || '',
        status: tournament.status || 'recruiting',
        date: tournament.date || '',
      });

      if (tournament.tournament_divisions && tournament.tournament_divisions.length > 0) {
        setDivisions(tournament.tournament_divisions.map((d: any) => ({
          id: d.id,
          name: d.name,
          date_start: d.date_start,
          time_start: d.time_start,
          location: d.location || '',
          fee: d.fee,
          capacity: d.capacity,
          account_bank: d.account_bank || '',
          account_number: d.account_number || '',
          account_owner: d.account_owner || ''
        })));
      }
      setLoading(false);
    }
    loadData();
  }, [editId, supabase, router]);

  // 핸들러들...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addDivision = () => {
    setDivisions([...divisions, { 
      name: '', date_start: formData.date, time_start: '09:00', location: formData.location_detail, 
      fee: 54000, capacity: 50, account_bank: '', account_number: '', account_owner: '' 
    }]);
  };

  const removeDivision = (index: number) => {
    const newDivisions = [...divisions];
    newDivisions.splice(index, 1);
    setDivisions(newDivisions);
  };

  const handleDivisionChange = (index: number, field: keyof Division, value: string | number) => {
    const newDivisions = [...divisions];
    // @ts-ignore
    newDivisions[index][field] = value;
    setDivisions(newDivisions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. 대회 기본 정보 저장
      const tournamentData = {
        title: formData.title,
        date: formData.date,
        location_city: formData.location_city,
        location_detail: formData.location_detail,
        location: formData.location_detail, 
        organizer: formData.organizer,
        host: formData.host, 
        sponsor: formData.sponsor, 
        game_ball: formData.game_ball, 
        description: formData.description,
        registration_link: formData.registration_link,
        status: formData.status,
        fee: divisions.length > 0 ? Math.min(...divisions.map(d => d.fee)) : 0,
        max_participants: divisions.reduce((acc, cur) => acc + Number(cur.capacity), 0),
      };

      let tournamentId = editId;

      if (isEditMode && editId) {
        const { error } = await supabase.from('tournaments').update(tournamentData).eq('id', editId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('tournaments').insert(tournamentData).select().single();
        if (error) throw error;
        tournamentId = data.id;
      }

      if (!tournamentId) throw new Error("대회 ID 생성 실패");

      // 2. 부서 정보 저장 (삭제 후 재생성)
      if (isEditMode) {
        await supabase.from('tournament_divisions').delete().eq('tournament_id', tournamentId);
      }

      const divisionsToInsert = divisions.map(div => ({
        tournament_id: tournamentId,
        name: div.name,
        date_start: div.date_start || formData.date,
        time_start: div.time_start,
        location: div.location || formData.location_detail,
        fee: Number(div.fee),
        capacity: Number(div.capacity),
        current_participants: 0, // 🔥 초기값 0으로 설정
        account_bank: div.account_bank,
        account_number: div.account_number,
        account_owner: div.account_owner,
        status: 'recruiting'
      }));

      const { error: divError } = await supabase.from('tournament_divisions').insert(divisionsToInsert);
      if (divError) throw divError;

      toast.success(isEditMode ? '수정 완료!' : '등록 완료!');
      router.push('/admin');

    } catch (error: any) {
      console.error(error);
      toast.error(`오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32"> {/* 하단 바 공간 확보 */}
      
      {/* Header (Static으로 변경하여 겹침 방지) */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft size={20} />
            </Button>
            <h1 className="font-bold text-lg text-slate-900">
              {isEditMode ? '대회 정보 수정' : '새 대회 등록'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* 1. 기본 정보 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900">1. 대회 기본 정보</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">필수 입력 정보</CardTitle>
              <CardDescription>대회의 가장 기초적인 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 mb-1.5 block">대회명</label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="예: 제5회 Kim's 전국동호인테니스대회" 
                  className="font-bold text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">대표 날짜</label>
                <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">모집 상태</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="recruiting">접수중 (모집중)</option>
                  <option value="upcoming">대회 준비중 (예정)</option>
                  <option value="closed">마감 (종료)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">개최 지역 (시/도)</label>
                <Input name="location_city" value={formData.location_city} onChange={handleInputChange} placeholder="예: 대구" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">대표 장소</label>
                <Input name="location_detail" value={formData.location_detail} onChange={handleInputChange} placeholder="예: 경북대학교 테니스장 외" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">주최/주관</label>
                <Input name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="예: Kim's Tennis" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">후원사</label>
                <Input name="sponsor" value={formData.sponsor} onChange={handleInputChange} placeholder="예: 경상북도테니스협회..." />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">사용구</label>
                <Input name="game_ball" value={formData.game_ball} onChange={handleInputChange} placeholder="예: 낫소 짜르투어" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">외부 신청 링크 (선택)</label>
                <Input name="registration_link" value={formData.registration_link} onChange={handleInputChange} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. 부서 관리 (핵심) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900">2. 모집 부서 및 일정</h2>
            </div>
            <Button onClick={addDivision} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Plus size={16} className="mr-1" /> 부서 추가
            </Button>
          </div>

          <div className="space-y-4">
            {divisions.map((div, idx) => (
              <Card key={idx} className="border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-600">부서 #{idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeDivision(idx)} className="text-red-500 hover:bg-red-50 h-8">
                    <Trash2 size={14} className="mr-1" /> 삭제
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* 부서명 */}
                    <div className="md:col-span-3">
                      <label className="text-xs text-slate-500 mb-1 block">부서명</label>
                      <Input 
                        value={div.name} 
                        onChange={(e) => handleDivisionChange(idx, 'name', e.target.value)}
                        placeholder="예: 개나리부" 
                        className="font-bold"
                      />
                    </div>

                    {/* 일시 */}
                    <div className="md:col-span-3">
                      <label className="text-xs text-slate-500 mb-1 block">경기 날짜</label>
                      <Input 
                        type="date" 
                        value={div.date_start} 
                        onChange={(e) => handleDivisionChange(idx, 'date_start', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">시작 시간</label>
                      <Input 
                        type="time" 
                        value={div.time_start} 
                        onChange={(e) => handleDivisionChange(idx, 'time_start', e.target.value)}
                      />
                    </div>

                     {/* 장소 */}
                     <div className="md:col-span-4">
                      <label className="text-xs text-slate-500 mb-1 block">경기 장소</label>
                      <Input 
                        value={div.location} 
                        onChange={(e) => handleDivisionChange(idx, 'location', e.target.value)}
                        placeholder="대표 장소와 다르면 입력" 
                      />
                    </div>

                    {/* 참가비 & 정원 */}
                    <div className="md:col-span-3">
                      <label className="text-xs text-slate-500 mb-1 block">참가비 (원)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-2.5 top-3 text-slate-400" />
                        <Input 
                          type="number"
                          value={div.fee} 
                          onChange={(e) => handleDivisionChange(idx, 'fee', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">모집 팀수</label>
                      <Input 
                        type="number"
                        value={div.capacity} 
                        onChange={(e) => handleDivisionChange(idx, 'capacity', e.target.value)}
                      />
                    </div>

                    {/* 계좌 정보 */}
                    <div className="md:col-span-7 grid grid-cols-3 gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                       <div className="col-span-3 mb-1 flex items-center gap-1">
                          <CreditCard size={14} className="text-blue-600"/>
                          <span className="text-xs font-bold text-blue-700">입금 계좌 정보 (필수)</span>
                       </div>
                       <div className="col-span-1">
                          <Input 
                            placeholder="은행명" 
                            className="h-8 text-xs bg-white"
                            value={div.account_bank}
                            onChange={(e) => handleDivisionChange(idx, 'account_bank', e.target.value)}
                          />
                       </div>
                       <div className="col-span-1">
                          <Input 
                            placeholder="계좌번호" 
                            className="h-8 text-xs bg-white"
                            value={div.account_number}
                            onChange={(e) => handleDivisionChange(idx, 'account_number', e.target.value)}
                          />
                       </div>
                       <div className="col-span-1">
                          <Input 
                            placeholder="예금주" 
                            className="h-8 text-xs bg-white"
                            value={div.account_owner}
                            onChange={(e) => handleDivisionChange(idx, 'account_owner', e.target.value)}
                          />
                       </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. 상세 규정 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-slate-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">3. 상세 규정 및 안내</h2>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="대회 요강, 시상 내역, 참가 자격 등 상세 내용을 입력하세요."
                className="min-h-[400px] border-0 focus-visible:ring-0 p-6 text-base leading-relaxed resize-y"
              />
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Bottom Sticky Action Bar (모바일/PC 공통) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto flex justify-end">
           <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg h-14 shadow-lg">
              <Save size={20} className="mr-2" />
              {loading ? '저장 중...' : (isEditMode ? '수정 완료' : '대회 등록 완료')}
           </Button>
        </div>
      </div>

    </div>
  );
}