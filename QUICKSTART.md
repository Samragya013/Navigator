#!/usr/bin/env node

/**
 * Quick Start Guide
 * Run this script to validate your setup
 */

import fs from 'fs';
import path from 'path';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        log(`✓ ${description}`, 'green');
        return true;
    } else {
        log(`✗ ${description} - NOT FOUND: ${filePath}`, 'red');
        return false;
    }
}

function checkDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        log(`✓ ${description}`, 'green');
        return true;
    } else {
        log(`✗ ${description} - NOT FOUND: ${dirPath}`, 'red');
        return false;
    }
}

console.log('\n' + '='.repeat(60));
log('  INTERACTIVE MAP - Quick Start Validation', 'cyan');
console.log('='.repeat(60) + '\n');

let allGood = true;

// Check Frontend
log('📁 Checking Frontend Files...', 'blue');
allGood &= checkFile('frontend/index.html', 'Frontend HTML');
allGood &= checkFile('frontend/styles.css', 'Frontend CSS');
allGood &= checkFile('frontend/app.js', 'Frontend App JavaScript');
allGood &= checkFile('frontend/map.js', 'Frontend Map JavaScript');

// Check Backend
console.log('');
log('📁 Checking Backend Files...', 'blue');
allGood &= checkFile('backend/server.js', 'Backend Server');
allGood &= checkFile('backend/package.json', 'Backend Package.json');
allGood &= checkDirectory('backend/routes', 'Backend Routes Directory');
allGood &= checkDirectory('backend/middleware', 'Backend Middleware Directory');
allGood &= checkDirectory('backend/services', 'Backend Services Directory');
allGood &= checkDirectory('backend/database', 'Backend Database Directory');

// Check Documentation
console.log('');
log('📁 Checking Documentation...', 'blue');
allGood &= checkFile('README.md', 'README Documentation');
allGood &= checkFile('DEPLOYMENT.md', 'Deployment Guide');
allGood &= checkFile('.gitignore', 'Git Ignore File');

// Check Backend Dependencies
console.log('');
log('📦 Checking Backend Dependencies...', 'blue');
const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const requiredDeps = ['express', 'cors', 'helmet', 'dotenv', 'axios'];
const hasDeps = requiredDeps.every(dep => backendPackage.dependencies[dep]);
if (hasDeps) {
    log('✓ All required dependencies listed in package.json', 'green');
} else {
    log('✗ Missing some dependencies in package.json', 'red');
    allGood = false;
}

// Check Environment
console.log('');
log('🔧 Checking Environment Setup...', 'blue');
if (fs.existsSync('backend/.env')) {
    log('✓ .env file exists', 'green');
} else {
    log('⚠ .env file not found (copy from .env.example)', 'yellow');
}

if (fs.existsSync('backend/.env.example')) {
    log('✓ .env.example template exists', 'green');
} else {
    log('✗ .env.example not found', 'red');
    allGood = false;
}

// Summary
console.log('\n' + '='.repeat(60));
if (allGood) {
    log('  ✓ All Checks Passed!', 'green');
} else {
    log('  ✗ Some checks failed. Review above.', 'red');
}
console.log('='.repeat(60));

// Next Steps
console.log('\n');
log('📋 Next Steps:', 'cyan');
console.log('');
console.log('1. Setup Backend:');
console.log('   cd backend');
console.log('   cp .env.example .env');
console.log('   # Edit .env with your values');
console.log('   npm install');
console.log('   npm run dev');
console.log('');
console.log('2. Setup Frontend:');
console.log('   Open: frontend/index.html');
console.log('   Or run: python -m http.server 3000');
console.log('');
console.log('3. Test Application:');
console.log('   Navigate to: http://localhost:3000');
console.log('   Click on map to test');
console.log('');
console.log('4. Deploy:');
console.log('   See DEPLOYMENT.md for detailed instructions');
console.log('');
console.log('='.repeat(60));
console.log('');
