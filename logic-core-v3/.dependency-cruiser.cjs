/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'Circular dependency — diagnostic report only',
      from: {},
      to: { circular: true },
    },
  ],

  options: {
    doNotFollow: {
      path: ['node_modules', '\\.next', 'src/generated'],
    },
    exclude: {
      path: [
        'node_modules',
        '\\.next',
        'scripts',
        'prisma/migrations',
        'public',
      ],
    },
    // Include type-only imports so type-only files aren't marked as orphans
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
}
