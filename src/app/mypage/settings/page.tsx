'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Trash2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // 회원 탈퇴 로직 (API 호출)
  const handleWithdraw = async () => {
    if (!window.confirm('정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/withdraw', { method: 'DELETE' });
      if (!res.ok) throw new Error('탈퇴 처리에 실패했습니다.');

      await supabase.auth.signOut();
      alert('탈퇴가 완료되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       {/* 섹션 헤더 */}
       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">개인정보 설정</h2>
          <p className="text-sm text-slate-500">계정 정보를 관리할 수 있습니다.</p>
       </div>

       {/* 위험 구역 (회원 탈퇴) */}
       <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
          <h3 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
            <AlertCircle size={16}/> DANGER ZONE
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-slate-800">회원 탈퇴</p>
                <p className="text-xs text-slate-500 mt-1">
                    탈퇴 시 모든 참가 내역과 프로필이 즉시 삭제됩니다.
                </p>
            </div>
            <button 
                onClick={handleWithdraw}
                disabled={loading}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
            >
                <Trash2 size={16}/>
                {loading ? '처리중...' : '계정 삭제'}
            </button>
          </div>
       </div>
    </div>
  );
}