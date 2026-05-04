// ESLint custom rule: icons-index-consistency (TypeScript version)
// Usage: Add this plugin to your ESLint config and enable the rule.

import fs from 'fs'
import path from 'path'
import { Rule } from 'eslint'

const iconsIndexConsistencyRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure all .vue files in src/icons are exported in src/icons/index.ts',
    },
    schema: [],
  },
  create(context) {
    // Only run for the index.ts file in icons
    if (!context.getFilename().replace(/\\/g, '/').endsWith('/src/icons/index.ts')) {
      return {}
    }
    const iconsDir = path.resolve(__dirname, '../src/icons')
    const vueFiles = fs
      .readdirSync(iconsDir)
      .filter((f) => f.endsWith('.vue'))
      .map((f) => f.replace('.vue', ''))
    const sourceCode = context.getSourceCode().getText()
    return {
      Program() {
        vueFiles.forEach((icon) => {
          if (!sourceCode.includes(icon)) {
            context.report({
              message: `Icon file '${icon}.vue' is not exported in index.ts`,
              loc: { line: 1, column: 0 },
            })
          }
        })
      },
    }
  },
}

const plugin = {
  rules: {
    'icons-index-consistency': iconsIndexConsistencyRule,
  },
}

export default plugin
