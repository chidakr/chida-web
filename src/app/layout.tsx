import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '치다 - 테니스 대회의 모든 것',
  description: '전국 테니스 대회 정보를 한눈에 확인하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header /> {/* 👈 여기에 넣으면 모든 페이지 상단 고정! */}
        {children}
      </body>
    </html>
  );
}