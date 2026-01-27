'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LOCATIONS } from '@/constants/tournaments';
import toast from 'react-hot-toast';

export default function AdminWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id'); // 수정 모드: ?id=xxx
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    location: '',
    fee: 0,
    max_participants: 32,
    site_url: '',
    description: '',
    level: '오픈부',
  });

  // 수정 모드: 기존 데이터 불러오기
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      const fetchTournament = async () => {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', editId)
          .single();
        
        if (data && !error) {
          setFormData({
            title: data.title || '',
            date: data.date || '',
            time: data.time || '09:00',
            location: data.location || '',
            fee: data.fee || 0,
            max_participants: data.max_participants || 32,
            site_url: data.site_url || '',
            description: data.description || '',
            level: data.level || '오픈부',
          });
          if (data.image_url) {
            setExistingImageUrl(data.image_url);
            setPreviewUrl(data.image_url);
          }
        }
      };
      fetchTournament();
    }
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🖼️ 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    // 미리보기 URL 생성
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // ❌ 이미지 삭제 핸들러
  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmMsg = isEditMode ? '수정 사항을 저장하시겠습니까?' : '이대로 대회를 등록하시겠습니까?';
    if (!confirm(confirmMsg)) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('관리자 로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    let imageUrl = existingImageUrl;

    // 새 이미지 업로드
    if (imageFile) {
      // 파일 크기 검증 (5MB 제한)
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error('이미지 크기는 5MB 이하여야 합니다.');
        setLoading(false);
        return;
      }

      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(imageFile.type)) {
        toast.error('JPG, PNG, WEBP 형식만 업로드 가능합니다.');
        setLoading(false);
        return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tournaments')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('이미지 업로드 실패:', uploadError);
        toast.error('이미지 업로드 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    const payload = {
      ...formData,
      image_url: imageUrl,
      current_participants: isEditMode ? undefined : 0,
      status: isEditMode ? undefined : 'recruiting',
    };

    // 수정 모드: update / 등록 모드: insert
    const { error } = isEditMode
      ? await supabase.from('tournaments').update(payload).eq('id', editId)
      : await supabase.from('tournaments').insert(payload);

    if (error) {
      console.error(error);
      toast.error('저장 실패! 콘솔을 확인해주세요.');
    } else {
      toast.success(isEditMode ? '✅ 대회 정보가 수정되었습니다!' : '🎉 대회가 등록되었습니다!');
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-5">
      <div className="max-w-2xl mx-auto">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="text-slate-500 font-bold flex items-center gap-1 hover:text-slate-800">
                <ChevronLeft size={20}/> 관리자 홈
            </Link>
            <h1 className="text-2xl font-black text-slate-900">{isEditMode ? '대회 수정' : '대회 등록'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            
            {/* 1. 이미지 업로드 섹션 (가장 중요!) */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">대회 포스터</label>
                
                {!previewUrl ? (
                    // 이미지가 없을 때: 업로드 버튼 표시
                    <div className="relative w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon className="text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-400 font-bold group-hover:text-blue-500">클릭해서 이미지 업로드</p>
                    </div>
                ) : (
                    // 이미지가 있을 때: 미리보기 표시
                    <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                        <Image 
                            src={previewUrl} 
                            alt="Preview" 
                            fill 
                            className="object-cover" 
                        />
                        {/* 삭제 버튼 */}
                        <button 
                            type="button"
                            onClick={removeImage}
                            className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* 2. 기본 정보 */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 border-b pb-2">기본 정보</h3>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">대회명</label>
                    <input 
                        name="title" required value={formData.title} onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                        placeholder="ex) 제1회 치다배 테니스 대회"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">날짜</label>
                        <input 
                            type="date" name="date" required value={formData.date} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">시간</label>
                        <input 
                            type="time" name="time" required value={formData.time} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">지역</label>
                        <select 
                            name="location" required value={formData.location} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                        >
                            <option value="">지역 선택</option>
                            {LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">레벨 (구분)</label>
                        <select 
                            name="level" value={formData.level} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        >
                            <option value="오픈부">오픈부</option>
                            <option value="신인부">신인부</option>
                            <option value="국화부">국화부</option>
                            <option value="개나리부">개나리부</option>
                            <option value="테린이">테린이</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. 모집 정보 */}
            <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 border-b pb-2">모집 정보</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">참가비 (팀당)</label>
                        <input 
                            type="number" name="fee" required value={formData.fee} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">최대 팀 수</label>
                        <input 
                            type="number" name="max_participants" required value={formData.max_participants} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            placeholder="32"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-blue-600 mb-1">🔗 외부 신청 링크</label>
                    <input 
                        name="site_url" required value={formData.site_url} onChange={handleChange}
                        className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl focus:outline-none focus:border-blue-500"
                        placeholder="https://..."
                    />
                </div>
            </div>

            {/* 4. 상세 내용 */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">상세 요강</label>
                <textarea 
                    name="description" rows={5} value={formData.description} onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="대회 상세 내용을 입력하세요..."
                />
            </div>

            {/* 등록 버튼 */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
                <Save size={20}/>
{loading ? (isEditMode ? '수정 저장중...' : '등록 중...') : (isEditMode ? '수정 완료' : '대회 등록 완료')}
            </button>

        </form>
      </div>
    </div>
  );
}