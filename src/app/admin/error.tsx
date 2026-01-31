'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-bold text-slate-900">오류가 발생했어요</h2>
      <p className="text-sm text-slate-500 text-center max-w-sm">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700"
        >
          다시 시도
        </button>
        <Link
          href="/admin"
          className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50"
        >
          관리자 홈으로
        </Link>
      </div>
    </div>
  );
}
