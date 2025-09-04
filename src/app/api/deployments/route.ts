import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    const deploymentLogPath = path.join(process.cwd(), '.deployment-log.json')

    let logData
    try {
      const data = await fs.readFile(deploymentLogPath, 'utf8')
      logData = JSON.parse(data)
    } catch (error) {
      // 배포 로그가 없는 경우
      logData = {
        deployments: [],
        lastDeployment: null,
        totalDeployments: 0
      }
    }

    switch (action) {
      case 'stats':
        const stats = {
          total: logData.totalDeployments,
          successful: logData.deployments.filter((d: any) => d.status === 'success').length,
          failed: logData.deployments.filter((d: any) => d.status === 'failed').length,
          lastDeployment: logData.lastDeployment,
          successRate: logData.totalDeployments > 0
            ? ((logData.deployments.filter((d: any) => d.status === 'success').length / logData.totalDeployments) * 100).toFixed(1) + '%'
            : '0%'
        }
        return NextResponse.json(stats)

      case 'recent':
        const limit = parseInt(searchParams.get('limit') || '10')
        const recent = logData.deployments.slice(0, limit)
        return NextResponse.json(recent)

      case 'report':
        const report = generateDeploymentReport(logData)
        return NextResponse.json(report)

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['stats', 'recent', 'report']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateDeploymentReport(logData: any) {
  const deployments = logData.deployments || []

  // 최근 30일 배포 통계
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentDeployments = deployments.filter((d: any) =>
    new Date(d.timestamp) > thirtyDaysAgo
  )

  // 환경별 통계
  const environmentStats = {}
  deployments.forEach((d: any) => {
    if (!environmentStats[d.environment]) {
      environmentStats[d.environment] = { total: 0, successful: 0, failed: 0 }
    }
    environmentStats[d.environment].total++
    if (d.status === 'success') {
      environmentStats[d.environment].successful++
    } else if (d.status === 'failed') {
      environmentStats[d.environment].failed++
    }
  })

  // 평균 빌드 시간 계산
  const successfulDeployments = deployments.filter((d: any) => d.status === 'success' && d.buildTime)
  const averageBuildTime = successfulDeployments.length > 0
    ? successfulDeployments.reduce((sum: number, d: any) => sum + d.buildTime, 0) / successfulDeployments.length
    : 0

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalDeployments: logData.totalDeployments,
      successRate: deployments.length > 0
        ? ((deployments.filter((d: any) => d.status === 'success').length / deployments.length) * 100).toFixed(1) + '%'
        : '0%',
      averageBuildTime: Math.round(averageBuildTime),
      lastDeployment: logData.lastDeployment
    },
    recentActivity: {
      last30Days: recentDeployments.length,
      today: deployments.filter((d: any) =>
        new Date(d.timestamp).toDateString() === new Date().toDateString()
      ).length
    },
    environmentStats,
    healthStatus: analyzeHealthStatus(deployments)
  }
}

function analyzeHealthStatus(deployments: any[]) {
  if (deployments.length === 0) return 'unknown'

  const recent = deployments.slice(0, 10)
  const successRate = (recent.filter(d => d.status === 'success').length / recent.length) * 100

  if (successRate >= 90) return 'healthy'
  if (successRate >= 70) return 'warning'
  return 'critical'
}
