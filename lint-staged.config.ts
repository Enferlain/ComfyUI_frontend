import path from 'node:path'

export default {
  './**/*.js': (stagedFiles: string[]) => formatAndEslint(stagedFiles),

  './**/*.{ts,tsx,vue,mts}': (stagedFiles: string[]) => [
    ...formatAndEslint(stagedFiles),
    'pnpm typecheck'
  ]
}

function formatAndEslint(fileNames: string[]) {
  // Convert absolute paths to relative paths for better ESLint resolution
  // Normalize to forward slashes for cross-platform compatibility (ESLint/prettier)
  const relativePaths = fileNames.map((f) =>
    path.relative(process.cwd(), f).replaceAll('\\', '/')
  )
  const joinedPaths = relativePaths.map((p) => `"${p}"`).join(' ')
  return [
    `pnpm exec prettier --cache --write ${joinedPaths}`,
    `pnpm exec oxlint --fix ${joinedPaths}`,
    `pnpm exec eslint --cache --fix --no-warn-ignored ${joinedPaths}`
  ]
}
