#!/usr/bin/env node
/**
 * Prepare release build
 * Run: pnpm prepare:release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = path.join(__dirname, '../package.json');
const APP_JSON = path.join(__dirname, '../app.json');

function getVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function bumpVersion(type) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2));
  
  // Also update app.json
  const app = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
  app.expo.version = newVersion;
  fs.writeFileSync(APP_JSON, JSON.stringify(app, null, 2));
  
  console.log(`Version bumped to ${newVersion}`);
  return newVersion;
}

function runTests() {
  console.log('Running tests...');
  try {
    execSync('pnpm test', { stdio: 'inherit' });
    console.log('✓ Tests passed');
  } catch (error) {
    console.error('✗ Tests failed');
    process.exit(1);
  }
}

function runLint() {
  console.log('Running lint...');
  try {
    execSync('pnpm lint', { stdio: 'inherit' });
    console.log('✓ Lint passed');
  } catch (error) {
    console.error('✗ Lint failed');
    process.exit(1);
  }
}

function runTypecheck() {
  console.log('Running typecheck...');
  try {
    execSync('pnpm typecheck', { stdio: 'inherit' });
    console.log('✓ Typecheck passed');
  } catch (error) {
    console.error('✗ Typecheck failed');
    process.exit(1);
  }
}

function buildBundles() {
  console.log('Building bundles...');
  try {
    execSync('pnpm bundle:ios', { stdio: 'inherit' });
    execSync('pnpm bundle:android', { stdio: 'inherit' });
    console.log('✓ Bundles built');
  } catch (error) {
    console.error('✗ Bundle build failed');
    process.exit(1);
  }
}

function generateChangelog(version) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  }
  
  const newEntry = `## [${version}] - ${date}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n### Security\n- \n\n`;
  
  const newChangelog = changelog.replace('# Changelog', `# Changelog\n\n${newEntry}`);
  fs.writeFileSync(changelogPath, newChangelog);
  
  console.log('Changelog updated');
}

function commitChanges(version) {
  try {
    execSync('git add package.json app.json CHANGELOG.md', { stdio: 'inherit' });
    execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' });
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    console.log('Changes committed and tagged');
  } catch (error) {
    console.error('Git operations failed:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const skipTests = args.includes('--skip-tests');
  const skipBuild = args.includes('--skip-build');
  
  console.log('🚀 Preparing release...');
  
  // Run checks
  if (!skipTests) {
    runTests();
    runLint();
    runTypecheck();
  }
  
  // Bump version
  const version = bumpVersion(type);
  
  // Build bundles
  if (!skipBuild) {
    buildBundles();
  }
  
  // Generate changelog
  generateChangelog(version);
  
  // Commit and tag
  commitChanges(version);
  
  console.log(`\n✅ Release v${version} prepared!`);
  console.log('Next steps:');
  console.log('  1. Review CHANGELOG.md');
  console.log('  2. Push with: git push origin main --tags');
  console.log('  3. Create GitHub release');
  console.log('  4. Submit to App Store / Play Store');
}

main().catch(console.error);