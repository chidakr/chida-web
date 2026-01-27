import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';

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
        <Header />
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}