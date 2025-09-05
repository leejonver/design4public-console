require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 환경 변수 확인:');
console.log('URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('KEY:', supabaseKey ? '✅ 설정됨' : '❌ 없음');

if (!supabaseUrl || !supabaseKey) {
  console.log('환경 변수가 올바르게 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n🔍 데이터베이스 테이블 확인 중...');

  const requiredTables = [
    'profiles', 'projects', 'items', 'brands', 'tags',
    'project_images', 'project_items', 'project_tags', 'image_tags'
  ];

  const results = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        results.push({ table, status: 'missing', error: '테이블 없음' });
      } else if (error) {
        results.push({ table, status: 'error', error: error.message });
      } else {
        results.push({ table, status: 'exists', count: data ? data.length : 0 });
      }
    } catch (err) {
      results.push({ table, status: 'error', error: err.message });
    }
  }

  console.log('\n📊 테이블 상태:');
  results.forEach(result => {
    const icon = result.status === 'exists' ? '✅' : result.status === 'missing' ? '❌' : '⚠️';
    console.log(`${icon} ${result.table}: ${result.status === 'exists' ? '존재함' : result.status === 'missing' ? '없음' : '오류 - ' + result.error}`);
  });

  const existing = results.filter(r => r.status === 'exists').length;
  const missing = results.filter(r => r.status === 'missing').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`\n📈 요약:`);
  console.log(`✅ 존재: ${existing}개`);
  console.log(`❌ 없음: ${missing}개`);
  console.log(`⚠️ 오류: ${errors}개`);

  if (missing > 0 || errors > 0) {
    console.log('\n🚨 스키마 생성이 필요합니다!');
  } else {
    console.log('\n🎉 모든 테이블이 정상적으로 존재합니다!');
  }
}

checkTables().catch(err => {
  console.error('❌ 연결 오류:', err.message);
});
