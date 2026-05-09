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
    if (!context.getFilename().replace(/\\/g, '/').endsWith('/src/icons/index.ts')) {
      return {}
    }

    // process.cwd() resolves to the app root where ESLint is invoked
    const iconsDir = path.resolve(process.cwd(), 'src/icons')
    const vueFiles = fs
      .readdirSync(iconsDir)
      .filter((file) => file.endsWith('.vue'))
      .map((file) => file.replace('.vue', ''))
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

const iconsIndexPlugin = {
  rules: {
    'icons-index-consistency': iconsIndexConsistencyRule,
  },
}

export default iconsIndexPlugin
