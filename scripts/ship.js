import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const run = (command) => {
    try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to execute command: ${command}`);
        process.exit(1);
    }
};

console.log('🚀 Preparing to ship...');

// 1. Build
console.log('📦 Building project...');
run('npm run build');

// 2. Check for changes
let hasChanges = false;
try {
    execSync('git diff --quiet', { stdio: 'ignore' });
    execSync('git diff --cached --quiet', { stdio: 'ignore' });
} catch (e) {
    hasChanges = true;
}

if (!hasChanges) {
    console.log('No changes detected. Pushing current state...');
    run('git push origin main');
    process.exit(0);
}

// 3. Prompt for commit message
rl.question('Commit type (feat, fix, docs, chore): ', (type) => {
    rl.question('Commit scope (optional): ', (scope) => {
        rl.question('Commit message: ', (msg) => {
            const scopePart = scope ? `(${scope})` : '';
            const fullMessage = `${type}${scopePart}: ${msg}`;

            console.log(`\n📝 Committing: "${fullMessage}"`);
            run(`git add .`);
            run(`git commit -m "${fullMessage}"`);

            console.log('🚀 Pushing to main...');
            run(`git push origin main`);

            console.log('✅ Shipped! Vercel should be deploying now.');
            rl.close();
        });
    });
});
