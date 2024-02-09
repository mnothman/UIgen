#!/usr/bin/env zx

console.log(`${chalk.bold(chalk.green('➜'))} Deploying v${fs.readJsonSync('./package.json').version}`)

if ((await $`git status --untracked-files=no --porcelain`.quiet()).stdout)
    console.log('⚠️  WARNING: Git worktree is dirty.')

const action = argv._[0]
const {DEPLOY_HOST='web'} = process.env

if (action === 'setup') {
    await $`ssh ${DEPLOY_HOST} 'mkdir -p /srv/apps/$APP_NAME'`
    await $`scp -C public/{app.png,favicon.png,manifest.json} ${DEPLOY_HOST}:/srv/apps/$APP_NAME`
}

await $`pnpm --color build`
await $`scp -C dist/{index.html,sw.js} ${DEPLOY_HOST}:/srv/apps/$APP_NAME`
await $`rm -rf dist`
