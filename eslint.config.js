import { sxzz } from '@sxzz/eslint-config'

export default sxzz().append({
  // @keep-sorted
  rules: {
    'import/no-default-export': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'unicorn/prefer-global-this': 'off',
    'unicorn/prefer-string-replace-all': 'off',
  },
})
