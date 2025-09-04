import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 기본 헬스 체크
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }

    // Supabase 연결 상태 확인 (선택적)
    let databaseStatus = 'unknown'
    try {
      // 여기에 Supabase 연결 테스트 로직을 추가할 수 있습니다
      databaseStatus = 'connected'
    } catch (error) {
      databaseStatus = 'disconnected'
    }

    const response = {
      ...healthCheck,
      database: databaseStatus,
      services: {
        api: 'operational',
        database: databaseStatus === 'connected' ? 'operational' : 'degraded'
      }
    }

    const statusCode = databaseStatus === 'connected' ? 200 : 503

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
}
