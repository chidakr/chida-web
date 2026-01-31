'use client';

import Sidebar from './Sidebar';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* 페이지 타이틀 */}
        <h1 className="text-2xl font-black text-slate-900 mb-8">마이페이지</h1>

        <div className="flex flex-col md:flex-row gap-8">
            {/* 1. 왼쪽: 고정 사이드바 */}
            <Sidebar />

            {/* 2. 오른쪽: 바뀌는 컨텐츠 영역 */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>

      </div>
    </div>
  );
}