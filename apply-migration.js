require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔄 프로필 트리거 마이그레이션 적용 중...');

  const sql = `
    -- 프로필 자동 생성 함수
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, role, status)
      VALUES (new.id, new.email, 'general', 'pending');
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 트리거 생성
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  try {
    // SQL을 실행하기 위해 raw SQL 사용
    const { error } = await supabase.from('profiles').select('*').limit(1); // 연결 테스트

    if (error) {
      console.log('❌ 데이터베이스 연결 실패:', error.message);
      return;
    }

    console.log('✅ 데이터베이스 연결 성공');
    console.log('📝 다음 SQL을 Supabase SQL Editor에서 실행해주세요:');
    console.log('');
    console.log('='.repeat(50));
    console.log(sql);
    console.log('='.repeat(50));
    console.log('');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/ftuudbxhffnbzjxgqagp/sql');

  } catch (error) {
    console.log('❌ 마이그레이션 적용 실패:', error.message);
  }
}

applyMigration();
