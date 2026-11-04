// Pure JavaScript Git Tool using isomorphic-git
// Works on macOS without requiring Xcode Command Line Tools

const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const REPO_DIR = path.resolve(__dirname);
const REMOTE_URL = 'https://github.com/85343397socheatakeo-del/nham-ey-ke.git';

// Patterns that MUST NEVER be committed
const RISKY_PATTERNS = [
  /node_modules/,
  /\.pkg$/i,
  /Antigravity\.app/i,
  /\.app$/i,
  /\.DS_Store$/i,
  /\.log$/i,
  /\.env/i,
  /\.(mp4|mov|avi|mkv|webm)$/i,
  /^\.git(\/|$)/,
  /\.firebase\//
];

function isRisky(filepath) {
  return RISKY_PATTERNS.some(regex => regex.test(filepath));
}

function getAllFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === '.git' || file === 'node_modules' || file === 'Antigravity.app') continue;
    const fullPath = path.join(dir, file);
    const relPath = base ? `${base}/${file}` : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function initRepo() {
  const gitDir = path.join(REPO_DIR, '.git');
  if (!fs.existsSync(gitDir)) {
    await git.init({ fs, dir: REPO_DIR, defaultBranch: 'main' });
    console.log('✅ Initialized new Git repository on branch: main');
  } else {
    console.log('ℹ️ Git repository already initialized');
  }

  // Set remote
  try {
    const remotes = await git.listRemotes({ fs, dir: REPO_DIR });
    if (!remotes.some(r => r.remote === 'origin')) {
      await git.addRemote({ fs, dir: REPO_DIR, remote: 'origin', url: REMOTE_URL });
      console.log(`✅ Set remote origin to: ${REMOTE_URL}`);
    }
  } catch (e) {
    console.error('Remote setup:', e.message);
  }
}

async function status() {
  await initRepo();
  const allFiles = getAllFiles(REPO_DIR);
  const safeFiles = allFiles.filter(f => !isRisky(f));
  const riskyFiles = allFiles.filter(f => isRisky(f));

  console.log('=== APPROVED FILES TO COMMIT ===');
  safeFiles.forEach(f => console.log(' +', f));

  if (riskyFiles.length > 0) {
    console.log('\n=== RISKY FILES (EXCLUDED BY GITIGNORE) ===');
    riskyFiles.forEach(f => console.log(' ❌ EXCLUDED:', f));
  }
  return { safeFiles, riskyFiles };
}

async function commit(commitMsg = 'V1 class prototype') {
  await initRepo();
  const { safeFiles } = await status();

  console.log(`\nStaging ${safeFiles.length} safe files...`);
  for (const filepath of safeFiles) {
    await git.add({ fs, dir: REPO_DIR, filepath });
  }

  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message: commitMsg,
    author: {
      name: 'Nham Ey Ke Student Team',
      email: 'student@nham-ey-ke.local'
    }
  });

  console.log(`\n✅ Successfully committed as "${commitMsg}"! [SHA: ${sha.slice(0, 7)}]`);
  return sha;
}

async function push(token, username = '85343397socheatakeo-del') {
  if (!token) {
    console.error('❌ Error: GitHub Personal Access Token or Password required.');
    process.exit(1);
  }

  console.log(`Pushing branch 'main' to GitHub: ${REMOTE_URL}...`);
  const pushResult = await git.push({
    fs,
    http,
    dir: REPO_DIR,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username, password: token })
  });

  console.log('✅ Push complete!', pushResult);
}

// CLI handler
const cmd = process.argv[2] || 'status';
if (cmd === 'init') {
  initRepo();
} else if (cmd === 'status') {
  status();
} else if (cmd === 'commit') {
  const msg = process.argv[3] || 'V1 class prototype';
  commit(msg);
} else if (cmd === 'push') {
  const token = process.argv[3];
  const user = process.argv[4] || '85343397socheatakeo-del';
  push(token, user);
}
