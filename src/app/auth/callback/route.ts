import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // next 파라미터가 있으면 그걸 쓰고, 없으면 기본값 '/'
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient(); // await 추가 (Next.js 15, Supabase 최신)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 1. 로그인된 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. 이 유저가 'profiles' 테이블에 등록되어 있는지 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // 3. 분기 처리 (Traffic Control) 🚦
        if (profile) {
          // 🙆‍♂️ 기존 회원 -> 메인으로 이동
          // (원래 가려던 곳이 있으면 거기로, 없으면 홈으로)
          const forwardUrl = next === '/onboarding' ? '/' : next;
          return NextResponse.redirect(`${origin}${forwardUrl}`);
        } else {
          // 🙋‍♂️ 신규 회원 (프로필 없음) -> 온보딩으로 이동
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // 에러 발생 시 에러 페이지로
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}