import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-5 font-sans">
      <p className="text-6xl font-black text-slate-200 mb-4">404</p>
      <h1 className="text-xl font-bold text-slate-800 mb-2">페이지를 찾을 수 없어요</h1>
      <p className="text-slate-500 text-sm mb-8 text-center max-w-sm">
        주소가 잘못되었거나 페이지가 이동·삭제되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#3182F6] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
