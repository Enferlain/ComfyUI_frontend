import path from 'node:path'

export default {
  './**/*.js': (stagedFiles) => formatAndEslint(stagedFiles),

  './**/*.{ts,tsx,vue,mts}': (stagedFiles) => [
    ...formatAndEslint(stagedFiles),
    'pnpm typecheck'
  ]
}

function formatAndEslint(fileNames) {
  // Convert absolute paths to relative paths for better ESLint resolution
  // Normalize to forward slashes for cross-platform compatibility (ESLint/prettier)
  const relativePaths = fileNames.map((f) =>
    // eslint-disable-next-line no-undef
    path.relative(process.cwd(), f).replaceAll('\\', '/')
  )
  const joinedPaths = relativePaths.map((p) => `"${p}"`).join(' ')
  return [
    `prettier --cache --write ${joinedPaths}`,
    `oxlint --fix ${joinedPaths}`,
    `node node_modules/eslint/bin/eslint.js --fix --no-warn-ignored ${joinedPaths}`
  ]
}
