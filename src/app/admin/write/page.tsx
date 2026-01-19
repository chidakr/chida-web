'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminWrite() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    location: '',
    division: '신인부',
    organization: 'KATO', 
    court_type: 'Hard',
    fee: 0,
    status: '접수중',
    parking_desc: '',
    registration_link: '' // [NEW] 링크 저장할 변수
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date) return alert('필수 내용을 입력해주세요.');
    setLoading(true);

    try {
      let poster_url = null;

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('posters')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('posters')
          .getPublicUrl(fileName);
          
        poster_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('tournaments')
        .insert([{
          ...formData,
          poster_url: poster_url
        }]);

      if (error) throw error;

      alert('대회가 등록되었습니다! 🔥');
      router.push('/admin'); 
    } catch (error: any) {
      console.error(error);
      alert('업로드 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft/></button>
          <h1 className="text-2xl font-bold">새 대회 등록 (링크 연결형)</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold mb-2">대회 포스터</label>
            <div className="flex items-center gap-4">
              <label className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all relative overflow-hidden group">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                ) : (
                  <div className="text-center text-slate-400">
                    <Upload size={32} className="mx-auto mb-2"/>
                    <p className="text-sm">클릭해서 포스터 업로드</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {previewUrl && (
                <button type="button" onClick={() => { setPreviewUrl(null); setImageFile(null); }} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                  <X size={20}/>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">대회명</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-black" placeholder="대회 이름을 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">개최 날짜</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-black" />
            </div>
          </div>

          {/* [NEW] 신청 링크 입력칸 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-blue-600">🚩 신청 페이지 링크 (URL)</label>
            <input 
              value={formData.registration_link} 
              onChange={(e) => setFormData({...formData, registration_link: e.target.value})} 
              className="w-full p-3 bg-blue-50 rounded-lg border border-blue-100 outline-none focus:border-blue-500 text-blue-900" 
              placeholder="예: https://kato.kr/apply/123 또는 네이버 폼 주소" 
            />
            <p className="text-xs text-slate-400 mt-1">입력하지 않으면 버튼이 비활성화됩니다.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-bold mb-1 text-slate-500">참가비</label>
               <input type="number" value={formData.fee} onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})} className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200" placeholder="0" />
             </div>
             <div>
               <label className="block text-xs font-bold mb-1 text-slate-500">주최 단체</label>
               <select value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200">
                 <option value="KATO">KATO</option>
                 <option value="KATA">KATA</option>
                 <option value="KTA">KTA</option>
                 <option value="Club">자체대회</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold mb-1 text-slate-500">부서</label>
               <select value={formData.division} onChange={(e) => setFormData({...formData, division: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200">
                 <option value="신인부">신인부</option>
                 <option value="오픈부">오픈부</option>
                 <option value="개나리">개나리</option>
                 <option value="국화부">국화부</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold mb-1 text-slate-500">상태</label>
               <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200">
                 <option value="접수중">접수중</option>
                 <option value="마감임박">마감임박</option>
                 <option value="접수대기">접수대기</option>
                 <option value="마감">마감</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold mb-2">장소</label>
               <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-black" placeholder="예: 올림픽공원" />
             </div>
             <div>
               <label className="block text-sm font-bold mb-2">코트 종류</label>
               <select value={formData.court_type} onChange={(e) => setFormData({...formData, court_type: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200">
                 <option value="Hard">하드</option>
                 <option value="Clay">클레이</option>
                 <option value="Omni">인조잔디</option>
               </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold mb-2">주차 및 특이사항</label>
             <textarea value={formData.parking_desc} onChange={(e) => setFormData({...formData, parking_desc: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-black h-24 resize-none" placeholder="주차 정보나 대회 특징을 적어주세요." />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-black text-white h-14 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            {loading ? '업로드 중...' : '대회 등록하기'}
          </button>

        </form>
      </div>
    </div>
  );
}