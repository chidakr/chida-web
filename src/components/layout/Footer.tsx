'use client';

import React from 'react';
import { Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pb-20 mt-24">
      <div className="max-w-7xl mx-auto px-5 pt-20">

        <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          {/* 왼쪽: 회사 정보 */}
          <div className="text-left space-y-2">
            <p className="text-[#65676A] font-medium text-base">© 2026 Chida Corp.</p>

            <div className="flex flex-col gap-1 text-base text-[#A7A7AA] font-normal">
              <div className="flex flex-wrap items-center gap-2">
                <span>주식회사 치다</span>
                <span className="w-px h-3 bg-slate-300 hidden sm:block"></span>
                <span>대표자 : 박영승</span>
              </div>
              <p>사업자등록번호 : 000-00-00000</p>
            </div>
          </div>

          {/* 오른쪽: 소셜 아이콘 */}
          <div className="flex gap-3">
            <SocialIcon href="https://facebook.com" icon={<Facebook size={20} />} />
            <SocialIcon href="https://youtube.com" icon={<Youtube size={20} />} />
            <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} />
          </div>

        </div>
      </div>
    </footer>
  );
}

// 소셜 아이콘 컴포넌트 (내부용)
function SocialIcon({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#A7A7AA] hover:bg-slate-200 hover:text-slate-600 transition-colors"
    >
      {icon}
    </a>
  );
}