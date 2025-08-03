#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 部署配置
const DEPLOY_CONFIG = {
  production: {
    branch: 'main',
    buildCommand: 'npm run build',
    testCommand: 'npm run test',
    healthCheckUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com',
    maxRetries: 3,
    retryDelay: 5000
  },
  staging: {
    branch: 'develop',
    buildCommand: 'npm run build',
    testCommand: 'npm run test',
    healthCheckUrl: process.env.STAGING_URL || 'https://staging.vibecoding.com',
    maxRetries: 2,
    retryDelay: 3000
  }
};

class DeploymentManager {
  constructor(environment = 'production') {
    this.environment = environment;
    this.config = DEPLOY_CONFIG[environment];
    this.startTime = Date.now();
    
    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[level] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async execute(command, description) {
    this.log(`${description}...`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.log(`${description} completed successfully`, 'success');
      return output;
    } catch (error) {
      this.log(`${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...');
    
    // 检查Node.js版本
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`);
    
    // 检查npm版本
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    this.log(`npm version: ${npmVersion}`);
    
    // 检查Git状态
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        this.log('Warning: Working directory has uncommitted changes', 'warning');
      }
    } catch (error) {
      this.log('Warning: Not in a Git repository', 'warning');
    }
    
    // 检查环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SITE_URL',
      'DATABASE_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      this.log(`Missing environment variables: ${missingEnvVars.join(', ')}`, 'warning');
    }
    
    this.log('Prerequisites check completed', 'success');
  }

  async runTests() {
    if (!this.config.testCommand) {
      this.log('No test command configured, skipping tests', 'warning');
      return;
    }
    
    await this.execute(this.config.testCommand, 'Running tests');
  }

  async buildApplication() {
    await this.execute(this.config.buildCommand, 'Building application');
    
    // 检查构建输出
    const buildDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found');
    }
    
    this.log('Build artifacts verified', 'success');
  }

  async generateStaticAssets() {
    this.log('Generating static assets...');
    
    // 生成sitemap
    try {
      await this.execute('node -e "require(\'./src/lib/build-optimization\').processBlogContent({ generateSitemap: true, generateRSS: true })"', 'Generating sitemap and RSS');
    } catch (error) {
      this.log('Static asset generation failed, continuing...', 'warning');
    }
  }

  async performHealthCheck() {
    this.log('Performing health check...');
    
    const healthCheckUrl = `${this.config.healthCheckUrl}/api/health`;
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        const response = await fetch(healthCheckUrl);
        
        if (response.ok) {
          this.log('Health check passed', 'success');
          return;
        } else {
          throw new Error(`Health check failed with status: ${response.status}`);
        }
      } catch (error) {
        retries++;
        this.log(`Health check attempt ${retries} failed: ${error.message}`, 'warning');
        
        if (retries < this.config.maxRetries) {
          this.log(`Retrying in ${this.config.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        } else {
          throw new Error(`Health check failed after ${this.config.maxRetries} attempts`);
        }
      }
    }
  }

  async createDeploymentReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const report = {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      nodeVersion: process.version,
      success: true,
      healthCheckUrl: this.config.healthCheckUrl
    };
    
    const reportPath = path.join(process.cwd(), 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Deployment report saved to ${reportPath}`, 'success');
    return report;
  }

  async deploy() {
    try {
      this.log(`Starting deployment to ${this.environment}...`);
      
      await this.checkPrerequisites();
      await this.runTests();
      await this.buildApplication();
      await this.generateStaticAssets();
      
      // 在实际部署中，这里会有部署到服务器的逻辑
      this.log('Deploying to server...', 'info');
      
      // 模拟部署延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.performHealthCheck();
      
      const report = await this.createDeploymentReport();
      
      this.log(`Deployment to ${this.environment} completed successfully! 🎉`, 'success');
      this.log(`Total deployment time: ${report.duration}`);
      
      return report;
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      
      // 创建失败报告
      const failureReport = {
        environment: this.environment,
        timestamp: new Date().toISOString(),
        duration: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
        success: false,
        error: error.message
      };
      
      const reportPath = path.join(process.cwd(), 'deployment-failure-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(failureReport, null, 2));
      
      throw error;
    }
  }
}

// CLI接口
async function main() {
  const environment = process.argv[2] || 'production';
  
  try {
    const deployer = new DeploymentManager(environment);
    await deployer.deploy();
    process.exit(0);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { DeploymentManager };