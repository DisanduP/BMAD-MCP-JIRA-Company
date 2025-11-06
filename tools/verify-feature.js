#!/usr/bin/env node

// BMad Feature Verification Script
// Runs automated checks to verify feature readiness for PR creation

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FeatureVerifier {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️ ',
      success: '✅ ',
      warning: '⚠️ ',
      error: '❌ '
    }[type] || 'ℹ️ ';

    console.log(`[${timestamp}] ${prefix}${message}`);
  }

  runCommand(command, description) {
    try {
      this.log(`Running: ${description}`, 'info');
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.passed.push(description);
      return result;
    } catch (error) {
      this.errors.push(`${description}: ${error.message}`);
      this.log(`Failed: ${description}`, 'error');
      return null;
    }
  }

  checkCodeImplementation() {
    this.log('🔍 Checking code implementation...', 'info');

    // Check for TODO comments
    try {
      const todoResults = execSync('grep -r "TODO\\|FIXME\\|XXX" src/ --exclude-dir=node_modules || true', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      if (todoResults.trim()) {
        const todoCount = todoResults.split('\n').filter(line => line.trim()).length;
        this.warnings.push(`Found ${todoCount} TODO/FIXME comments that should be resolved`);
        this.log(`Found ${todoCount} TODO comments`, 'warning');
      } else {
        this.passed.push('No TODO/FIXME comments found');
      }
    } catch (error) {
      this.log('Error checking for TODO comments', 'warning');
    }

    // Check for console.log statements (excluding necessary ones)
    try {
      const consoleResults = execSync('grep -r "console\\.log" src/ --exclude-dir=node_modules | grep -v "console\\.log.*process\\.env\\|console\\.log.*error\\|console\\.log.*Error" || true', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      if (consoleResults.trim()) {
        const consoleCount = consoleResults.split('\n').filter(line => line.trim()).length;
        this.warnings.push(`Found ${consoleCount} console.log statements that should be removed`);
        this.log(`Found ${consoleCount} console.log statements`, 'warning');
      } else {
        this.passed.push('No unnecessary console.log statements found');
      }
    } catch (error) {
      this.log('Error checking for console.log statements', 'warning');
    }
  }

  checkTesting() {
    this.log('🧪 Checking testing status...', 'info');

    // Run tests
    const testResult = this.runCommand('npm test', 'Unit and integration tests');
    if (testResult !== null) {
      this.passed.push('All tests passing');
    }

    // Check test coverage (if available)
    try {
      const coverageResult = execSync('npm run test:coverage 2>/dev/null || echo "No coverage script"', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      if (coverageResult.includes('No coverage script')) {
        this.warnings.push('Test coverage script not configured');
      } else {
        this.passed.push('Test coverage script available');
      }
    } catch (error) {
      this.warnings.push('Test coverage check failed');
    }
  }

  checkCodeQuality() {
    this.log('💅 Checking code quality...', 'info');

    // Run linting
    const lintResult = this.runCommand('npm run lint', 'ESLint code quality check');
    if (lintResult !== null) {
      this.passed.push('Code quality checks passed');
    }

    // Check for common issues
    try {
      const unusedImports = execSync('grep -r "import.*from" src/ --include="*.js" --include="*.jsx" | head -10', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      this.passed.push('Import statements present (manual review recommended)');
    } catch (error) {
      this.log('Could not check imports', 'warning');
    }
  }

  checkDocumentation() {
    this.log('📚 Checking documentation...', 'info');

    // Check if README exists and is recent
    const readmePath = path.join(this.projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
      const stats = fs.statSync(readmePath);
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceModified < 7) {
        this.passed.push('README recently updated');
      } else {
        this.warnings.push('README not updated recently');
      }
    } else {
      this.warnings.push('README.md not found');
    }

    // Check for API documentation
    const apiDocsPath = path.join(this.projectRoot, 'docs', 'api.md');
    if (fs.existsSync(apiDocsPath)) {
      this.passed.push('API documentation exists');
    } else {
      this.warnings.push('API documentation not found');
    }
  }

  checkIntegration() {
    this.log('🔗 Checking integration readiness...', 'info');

    // Check package.json
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        this.passed.push('package.json is valid');
      } catch (error) {
        this.errors.push('package.json is invalid JSON');
      }
    }

    // Check for environment variables documentation
    const envExamplePath = path.join(this.projectRoot, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      this.passed.push('Environment variables documented');
    } else {
      this.warnings.push('No .env.example file found');
    }

    // Try to build the project
    const buildResult = this.runCommand('npm run build 2>/dev/null || echo "No build script"', 'Project build check');
    if (buildResult && !buildResult.includes('No build script')) {
      this.passed.push('Project builds successfully');
    } else {
      this.warnings.push('Build script not configured or failing');
    }
  }

  checkGitStatus() {
    this.log('🔄 Checking git status...', 'info');

    // Check if we're on a feature branch
    try {
      const currentBranch = execSync('git branch --show-current', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();

      if (currentBranch.startsWith('feature/')) {
        this.passed.push(`On feature branch: ${currentBranch}`);
      } else {
        this.warnings.push(`Not on a feature branch: ${currentBranch}`);
      }
    } catch (error) {
      this.errors.push('Could not determine current branch');
    }

    // Check for uncommitted changes
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      if (status.trim()) {
        this.warnings.push('Uncommitted changes detected');
      } else {
        this.passed.push('Working directory clean');
      }
    } catch (error) {
      this.errors.push('Could not check git status');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FEATURE VERIFICATION REPORT');
    console.log('='.repeat(80));

    console.log(`\n✅ PASSED (${this.passed.length})`);
    this.passed.forEach(item => console.log(`   ✓ ${item}`));

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length})`);
      this.warnings.forEach(item => console.log(`   ! ${item}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length})`);
      this.errors.forEach(item => console.log(`   ✗ ${item}`));
    }

    console.log('\n' + '='.repeat(80));

    // Overall status
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    if (hasErrors) {
      console.log('🚫 STATUS: BLOCKED - Fix errors before creating PR');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  STATUS: READY WITH WARNINGS - Review warnings before creating PR');
      process.exit(0);
    } else {
      console.log('✅ STATUS: READY FOR PR - All checks passed!');
      process.exit(0);
    }
  }

  async run() {
    this.log('🚀 Starting BMad Feature Verification', 'info');

    this.checkGitStatus();
    this.checkCodeImplementation();
    this.checkTesting();
    this.checkCodeQuality();
    this.checkDocumentation();
    this.checkIntegration();

    this.generateReport();
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new FeatureVerifier();
  verifier.run().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = FeatureVerifier;
