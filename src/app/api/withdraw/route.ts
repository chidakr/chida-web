import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    // 1. 현재 로그인한 유저 확인 (서버 클라이언트 사용)
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 관리자 권한으로 Supabase 접속 (Service Role Key 필요)
    // ⚠️ 주의: process.env.SUPABASE_SERVICE_ROLE_KEY가 .env 파일에 있어야 합니다!
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. 유저 삭제 (Auth 테이블에서 삭제 -> Profiles는 cascade 설정되어 있다면 자동 삭제됨)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error('Delete User Error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 4. 성공 응답
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}