'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* 왼쪽: 회사 정보 */}
          <div className="space-y-3">
            <h3 className="text-xl font-black text-slate-300 tracking-tight">CHIDA</h3>
            <div className="space-y-1">
              <p className="text-[#65676A] font-medium text-sm">© 2026 Chida Corp. All rights reserved.</p>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm text-[#A7A7AA] font-normal">
                <div className="flex items-center gap-2">
                  <span>주식회사 치다</span>
                  <span className="w-px h-3 bg-slate-300 hidden md:block"></span>
                  <span>대표자 : 박영승</span>
                </div>
                <span className="hidden md:block text-slate-300">|</span>
                <p>사업자등록번호 : 000-00-00000</p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 소셜 아이콘 */}
          <div className="flex gap-3">
            <SocialIcon href="https://facebook.com" icon={<Facebook size={18} />} />
            <SocialIcon href="https://youtube.com" icon={<Youtube size={18} />} />
            <SocialIcon href="https://instagram.com" icon={<Instagram size={18} />} />
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
      className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#3182F6] hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}