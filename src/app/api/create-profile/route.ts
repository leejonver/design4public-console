import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // design4public@gmail.com 계정의 프로필 생성 또는 업데이트
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        {
          id: '14b1aeac-6f76-4907-98ea-ca7de23ee629', // 실제 사용자 ID
          email: 'design4public@gmail.com',
          role: 'master',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Profile upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // 프로필 상태 확인
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '14b1aeac-6f76-4907-98ea-ca7de23ee629')
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
