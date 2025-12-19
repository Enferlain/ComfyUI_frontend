import path from 'node:path'

export default {
  // IGNORE config files to be safe
  '!(eslint.config|lint-staged.config)*.js': (stagedFiles) => formatAndEslint(stagedFiles),

  './**/*.{ts,tsx,vue,mts}': (stagedFiles) => [
    ...formatAndEslint(stagedFiles),
    // 'pnpm typecheck'
  ]
}

function formatAndEslint(fileNames) {
  // Filter out config files explicitly
  const validFiles = fileNames.filter(f => !f.endsWith('eslint.config.ts') && !f.endsWith('lint-staged.config.js'));
  if (validFiles.length === 0) return [];

  const relativePaths = validFiles.map((f) =>
    path.relative(process.cwd(), f).replaceAll('\\', '/')
  )
  const joinedPaths = relativePaths.map((p) => `"${p}"`).join(' ')
  
  return [
    `prettier --cache --write ${joinedPaths}`,
    `oxlint --fix ${joinedPaths}`,
    // -----------------------------------------------------------
    // DISABLE ESLINT HERE: It causes native crashes on Node 22/Windows
    // `node node_modules/eslint/bin/eslint.js --fix --no-warn-ignored ${joinedPaths}`
    // -----------------------------------------------------------
  ]
}