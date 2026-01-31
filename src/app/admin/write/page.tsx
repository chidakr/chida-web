'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, Save, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LOCATIONS } from '@/constants/tournaments';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AdminWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    end_date: '',
    location_city: '',
    location_detail: '',
    category: '일반',
    max_participants: 32,
    fee: 54000,
    registration_link: '',
    content_overview: '',
    content_recruitment: '',
    content_rules: '',
    account: '',
    account_holder: '',
  });

  const [divisions, setDivisions] = useState<string[]>(['개나리부']);
  const [prizes, setPrizes] = useState([{ rank: '우승 (1위)', reward: '상금 100만원 + 상패' }]);
  const [schedule, setSchedule] = useState([{ date: '', division: '', time: '09:00' }]);

  const fetchTournament = useCallback(async () => {
    if (!editId) return;

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', editId)
      .single();

    if (data && !error) {
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        date: data.date || '',
        end_date: data.end_date || '',
        location_city: data.location_city || data.location || '',
        location_detail: data.location_detail || '',
        category: data.category || '일반',
        max_participants: data.max_participants || 32,
        fee: data.fee || 54000,
        registration_link: data.registration_link || '',
        content_overview: data.content_overview || data.description || '',
        content_recruitment: data.content_recruitment || '',
        content_rules: data.content_rules || '',
        account: data.account || '',
        account_holder: data.account_holder || '',
      });

      if (data.divisions) setDivisions(Array.isArray(data.divisions) ? data.divisions : []);
      if (data.prizes) setPrizes(Array.isArray(data.prizes) ? data.prizes : []);
      if (data.schedule) setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
      if (data.thumbnail_url) {
        setExistingImageUrl(data.thumbnail_url);
        setPreviewUrl(data.thumbnail_url);
      }
    }
  }, [editId, supabase]);

  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      fetchTournament();
    }
  }, [editId, fetchTournament]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(isEditMode ? '수정 사항을 저장하시겠습니까?' : '이대로 대회를 등록하시겠습니까?')) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('관리자 로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    let imageUrl = existingImageUrl;

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error('이미지 크기는 5MB 이하여야 합니다.');
        setLoading(false);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(imageFile.type)) {
        toast.error('JPG, PNG, WEBP 형식만 업로드 가능합니다.');
        setLoading(false);
        return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tournaments')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ 이미지 업로드 실패:', uploadError);
        toast.error(`이미지 업로드 실패: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('tournaments')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      date: formData.date,
      end_date: formData.end_date || formData.date,
      location: formData.location_city, // 하위 호환
      location_city: formData.location_city,
      location_detail: formData.location_detail,
      category: formData.category,
      max_participants: formData.max_participants,
      fee: formData.fee,
      current_participants: isEditMode ? undefined : 0,
      status: isEditMode ? undefined : 'recruiting',
      thumbnail_url: imageUrl,
      registration_link: formData.registration_link,
      content_overview: formData.content_overview,
      content_recruitment: formData.content_recruitment,
      content_rules: formData.content_rules,
      description: formData.content_overview, // 하위 호환
      divisions: JSON.stringify(divisions),
      prizes: JSON.stringify(prizes),
      schedule: JSON.stringify(schedule),
      account: formData.account,
      account_holder: formData.account_holder,
    };

    const { error } = isEditMode
      ? await supabase.from('tournaments').update(payload).eq('id', editId)
      : await supabase.from('tournaments').insert(payload);

    if (error) {
      console.error('❌ Supabase Error:', error);
      toast.error(`저장 실패: ${error.message}`);
    } else {
      toast.success(isEditMode ? '✅ 대회 정보가 수정되었습니다!' : '🎉 대회가 등록되었습니다!');
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-5">
      <div className="max-w-3xl mx-auto">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin" className="text-slate-500 font-medium flex items-center gap-1 hover:text-slate-900 tracking-tight transition-colors">
            <ChevronLeft size={18}/> 관리자 홈
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {isEditMode ? '대회 수정' : '대회 등록'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. 이미지 업로드 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">대회 포스터</CardTitle>
              <CardDescription className="tracking-tight">대회를 대표하는 이미지를 업로드하세요</CardDescription>
            </CardHeader>
            <CardContent>
              {!previewUrl ? (
                <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-slate-400 group-hover:text-blue-500" size={20}/>
                  </div>
                  <p className="text-sm text-slate-500 font-medium group-hover:text-blue-600 tracking-tight">
                    클릭해서 이미지 업로드
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-red-500 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. 기본 정보 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">대회명 *</label>
                <Input 
                  name="title" 
                  required 
                  value={formData.title} 
                  onChange={handleChange}
                  className="border-slate-200 tracking-tight"
                  placeholder="ex) 제1회 치다배 테니스 대회"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">부제목 (선택)</label>
                <Input 
                  name="subtitle" 
                  value={formData.subtitle} 
                  onChange={handleChange}
                  className="border-slate-200 tracking-tight"
                  placeholder="ex) 테니스를 사랑하는 모든 이들을 위한 축제"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">시작일 *</label>
                  <Input 
                    type="date" 
                    name="date" 
                    required 
                    value={formData.date} 
                    onChange={handleChange}
                    className="border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">종료일</label>
                  <Input 
                    type="date" 
                    name="end_date" 
                    value={formData.end_date} 
                    onChange={handleChange}
                    className="border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">카테고리 *</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 tracking-tight"
                  >
                    <option value="일반">일반</option>
                    <option value="신인부">신인부</option>
                    <option value="오픈부">오픈부</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">모집 팀 수 *</label>
                  <Input 
                    type="number" 
                    name="max_participants" 
                    required 
                    value={formData.max_participants} 
                    onChange={handleChange}
                    className="border-slate-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. 장소 정보 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">장소 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">지역 *</label>
                <select 
                  name="location_city" 
                  required 
                  value={formData.location_city} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 tracking-tight"
                >
                  <option value="">지역 선택</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">상세 주소</label>
                <Input 
                  name="location_detail" 
                  value={formData.location_detail} 
                  onChange={handleChange}
                  className="border-slate-200 tracking-tight"
                  placeholder="ex) 서울특별시 강남구 테니스장로 123"
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. 참가 부문 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">참가 부문</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {divisions.map((div, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    value={div} 
                    onChange={(e) => {
                      const newDivisions = [...divisions];
                      newDivisions[idx] = e.target.value;
                      setDivisions(newDivisions);
                    }}
                    className="border-slate-200 tracking-tight"
                    placeholder="ex) 개나리부"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDivisions(divisions.filter((_, i) => i !== idx))}
                    className="border-slate-200 active:scale-95 transition-transform"
                  >
                    <Trash2 size={16}/>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDivisions([...divisions, ''])}
                className="w-full border-slate-200 active:scale-95 transition-transform tracking-tight"
              >
                <Plus size={16} className="mr-1"/> 부문 추가
              </Button>
            </CardContent>
          </Card>

          {/* 5. 상금 정보 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">상금 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    value={prize.rank} 
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].rank = e.target.value;
                      setPrizes(newPrizes);
                    }}
                    className="border-slate-200 tracking-tight"
                    placeholder="순위"
                  />
                  <Input 
                    value={prize.reward} 
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].reward = e.target.value;
                      setPrizes(newPrizes);
                    }}
                    className="border-slate-200 tracking-tight"
                    placeholder="상금"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrizes(prizes.filter((_, i) => i !== idx))}
                    className="border-slate-200 active:scale-95 transition-transform"
                  >
                    <Trash2 size={16}/>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrizes([...prizes, { rank: '', reward: '' }])}
                className="w-full border-slate-200 active:scale-95 transition-transform tracking-tight"
              >
                <Plus size={16} className="mr-1"/> 상금 추가
              </Button>
            </CardContent>
          </Card>

          {/* 6. 일정 정보 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">일정 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedule.map((sch, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Input 
                    value={sch.date} 
                    onChange={(e) => {
                      const newSchedule = [...schedule];
                      newSchedule[idx].date = e.target.value;
                      setSchedule(newSchedule);
                    }}
                    className="border-slate-200 tracking-tight"
                    placeholder="날짜"
                  />
                  <Input 
                    value={sch.division} 
                    onChange={(e) => {
                      const newSchedule = [...schedule];
                      newSchedule[idx].division = e.target.value;
                      setSchedule(newSchedule);
                    }}
                    className="border-slate-200 tracking-tight"
                    placeholder="부문"
                  />
                  <div className="flex gap-2">
                    <Input 
                      value={sch.time} 
                      onChange={(e) => {
                        const newSchedule = [...schedule];
                        newSchedule[idx].time = e.target.value;
                        setSchedule(newSchedule);
                      }}
                      className="border-slate-200 tracking-tight"
                      placeholder="시간"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                      className="border-slate-200 active:scale-95 transition-transform"
                    >
                      <Trash2 size={16}/>
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSchedule([...schedule, { date: '', division: '', time: '09:00' }])}
                className="w-full border-slate-200 active:scale-95 transition-transform tracking-tight"
              >
                <Plus size={16} className="mr-1"/> 일정 추가
              </Button>
            </CardContent>
          </Card>

          {/* 7. 참가비 & 계좌 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">참가비 & 입금 계좌</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">참가비 (팀당)</label>
                <Input 
                  type="number" 
                  name="fee" 
                  value={formData.fee} 
                  onChange={handleChange}
                  className="border-slate-200"
                  placeholder="54000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">계좌번호</label>
                  <Input 
                    name="account" 
                    value={formData.account} 
                    onChange={handleChange}
                    className="border-slate-200 tracking-tight"
                    placeholder="국민은행 000-000-000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">예금주</label>
                  <Input 
                    name="account_holder" 
                    value={formData.account_holder} 
                    onChange={handleChange}
                    className="border-slate-200 tracking-tight"
                    placeholder="홍길동"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. 상세 콘텐츠 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">상세 콘텐츠</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">대회 개요</label>
                <Textarea 
                  name="content_overview" 
                  rows={3} 
                  value={formData.content_overview} 
                  onChange={handleChange}
                  className="border-slate-200 resize-none tracking-tight"
                  placeholder="대회에 대한 간단한 소개를 작성하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">모집 요강</label>
                <Textarea 
                  name="content_recruitment" 
                  rows={4} 
                  value={formData.content_recruitment} 
                  onChange={handleChange}
                  className="border-slate-200 resize-none tracking-tight"
                  placeholder="자세한 모집 요강을 작성하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-tight">대회 규정</label>
                <Textarea 
                  name="content_rules" 
                  rows={4} 
                  value={formData.content_rules} 
                  onChange={handleChange}
                  className="border-slate-200 resize-none tracking-tight"
                  placeholder="대회 규정을 작성하세요"
                />
              </div>
            </CardContent>
          </Card>

          {/* 9. 외부 링크 */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold tracking-tight">외부 신청 링크</CardTitle>
              <CardDescription className="tracking-tight">외부 사이트에서 신청받는 경우 URL을 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                name="registration_link" 
                value={formData.registration_link} 
                onChange={handleChange}
                className="border-slate-200 tracking-tight"
                placeholder="https://..."
              />
            </CardContent>
          </Card>

          <Separator className="my-6"/>

          {/* 등록 버튼 */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 active:scale-95 transition-all shadow-sm tracking-tight"
          >
            <Save size={18} className="mr-2"/>
            {loading ? (isEditMode ? '수정 저장중...' : '등록 중...') : (isEditMode ? '수정 완료' : '대회 등록 완료')}
          </Button>

        </form>
      </div>
    </div>
  );
}
