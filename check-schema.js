// Quick schema check script
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '없음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 데이터베이스 스키마 확인 중...\n')

  const requiredTables = [
    'profiles',
    'projects',
    'items',
    'brands',
    'tags',
    'project_images',
    'project_items',
    'project_tags',
    'image_tags'
  ]

  const existingTables = []
  const missingTables = []

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === 'PGRST116') {
          missingTables.push(table)
        } else {
          console.log(`❌ ${table}: ${error.message}`)
        }
      } else {
        existingTables.push(table)
        console.log(`✅ ${table}: 존재함`)
      }
    } catch (err) {
      missingTables.push(table)
      console.log(`❌ ${table}: 연결 오류`)
    }
  }

  console.log('\n📊 결과 요약:')
  console.log(`✅ 존재하는 테이블: ${existingTables.length}개`)
  console.log(`❌ 없는 테이블: ${missingTables.length}개`)

  if (missingTables.length > 0) {
    console.log('\n🚨 생성이 필요한 테이블들:')
    missingTables.forEach(table => console.log(`  - ${table}`))
  }

  if (existingTables.length > 0) {
    console.log('\n✅ 이미 존재하는 테이블들:')
    existingTables.forEach(table => console.log(`  - ${table}`))
  }
}

checkSchema().catch(console.error)
