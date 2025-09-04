#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class DeploymentTracker {
  constructor() {
    this.deploymentLogPath = path.join(process.cwd(), '.deployment-log.json');
    this.currentVersion = this.getCurrentVersion();
  }

  getCurrentVersion() {
    try {
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      return packageJson.version;
    } catch (error) {
      return '1.0.0';
    }
  }

  async loadDeploymentLog() {
    try {
      const data = await fs.readFile(this.deploymentLogPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // 파일이 없거나 읽을 수 없는 경우 기본 구조 반환
      return {
        deployments: [],
        lastDeployment: null,
        totalDeployments: 0
      };
    }
  }

  async saveDeploymentLog(logData) {
    try {
      await fs.writeFile(this.deploymentLogPath, JSON.stringify(logData, null, 2));
      console.log('✅ 배포 로그가 저장되었습니다.');
    } catch (error) {
      console.error('❌ 배포 로그 저장 실패:', error.message);
    }
  }

  async recordDeployment(deploymentData) {
    const logData = await this.loadDeploymentLog();

    const deployment = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      version: this.currentVersion,
      environment: deploymentData.environment || 'production',
      status: deploymentData.status || 'success',
      url: deploymentData.url,
      commit: deploymentData.commit,
      branch: deploymentData.branch || 'main',
      triggeredBy: deploymentData.triggeredBy || 'unknown',
      buildTime: deploymentData.buildTime,
      ...deploymentData
    };

    logData.deployments.unshift(deployment);
    logData.lastDeployment = deployment;
    logData.totalDeployments = logData.deployments.length;

    // 최근 50개 배포만 유지
    if (logData.deployments.length > 50) {
      logData.deployments = logData.deployments.slice(0, 50);
    }

    await this.saveDeploymentLog(logData);

    console.log(`🚀 배포 기록 완료: ${deployment.environment} - ${deployment.version}`);
    console.log(`📊 총 배포 횟수: ${logData.totalDeployments}`);

    return deployment;
  }

  async getDeploymentStats() {
    const logData = await this.loadDeploymentLog();

    const stats = {
      total: logData.totalDeployments,
      successful: logData.deployments.filter(d => d.status === 'success').length,
      failed: logData.deployments.filter(d => d.status === 'failed').length,
      lastDeployment: logData.lastDeployment,
      recentDeployments: logData.deployments.slice(0, 5)
    };

    return stats;
  }

  async generateDeploymentReport() {
    const stats = await getDeploymentStats();
    const logData = await loadDeploymentLog();

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalDeployments: stats.total,
        successRate: ((stats.successful / stats.total) * 100).toFixed(1) + '%',
        lastDeployment: stats.lastDeployment,
        averageBuildTime: calculateAverageBuildTime(logData.deployments)
      },
      recentActivity: stats.recentDeployments,
      healthStatus: analyzeHealthStatus(logData.deployments)
    };

    return report;
  }
}

function calculateAverageBuildTime(deployments) {
  const buildTimes = deployments
    .filter(d => d.buildTime && d.status === 'success')
    .map(d => d.buildTime);

  if (buildTimes.length === 0) return 0;

  const total = buildTimes.reduce((sum, time) => sum + time, 0);
  return Math.round(total / buildTimes.length);
}

function analyzeHealthStatus(deployments) {
  if (deployments.length === 0) return 'unknown';

  const recent = deployments.slice(0, 10);
  const successRate = (recent.filter(d => d.status === 'success').length / recent.length) * 100;

  if (successRate >= 90) return 'healthy';
  if (successRate >= 70) return 'warning';
  return 'critical';
}

// CLI 인터페이스
async function main() {
  const tracker = new DeploymentTracker();
  const command = process.argv[2];

  switch (command) {
    case 'record':
      const deploymentData = {
        environment: process.argv[3] || process.env.NODE_ENV || 'production',
        status: process.argv[4] || 'success',
        url: process.argv[5] || process.env.DEPLOYMENT_URL,
        commit: process.env.GITHUB_SHA,
        branch: process.env.GITHUB_REF?.replace('refs/heads/', ''),
        triggeredBy: process.env.GITHUB_ACTOR || 'manual',
        buildTime: parseInt(process.argv[6]) || 0
      };
      await tracker.recordDeployment(deploymentData);
      break;

    case 'stats':
      const stats = await tracker.getDeploymentStats();
      console.log('📊 배포 통계:');
      console.log(`총 배포 횟수: ${stats.total}`);
      console.log(`성공: ${stats.successful}`);
      console.log(`실패: ${stats.failed}`);
      console.log(`마지막 배포: ${stats.lastDeployment?.timestamp}`);
      break;

    case 'report':
      const report = await tracker.generateDeploymentReport();
      console.log('📋 배포 보고서:');
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.log('사용법:');
      console.log('  record <environment> <status> <url> <buildTime>');
      console.log('  stats');
      console.log('  report');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentTracker;
