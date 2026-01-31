import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  // 👇 [수정됨] Next.js 15부터는 cookies()가 Promise이므로 await가 필수입니다!
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component에서는 쿠키를 직접 쓸 수 없을 때 에러가 날 수 있지만,
            // API Route나 Server Action에서는 정상 작동하므로 무시합니다.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 위와 동일한 이유로 무시
          }
        },
      },
    }
  );
}