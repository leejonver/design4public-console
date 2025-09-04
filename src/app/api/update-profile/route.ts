import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // design4public@gmail.com 계정을 마스터로 승인
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'master',
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'design4public@gmail.com')
      .select()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Master account updated successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
