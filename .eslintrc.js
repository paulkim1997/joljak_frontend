module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'plugin:vue/essential',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': 'off',
    'eqeqeq': 'off',
    "max-len": [2, {
      "code": 300
    }],
    // 'comma-dangle': 'off',
    // 'no-restricted-globals': 'off',
    // 'no-restricted-syntax': 'off',
    // 'space-before-function-paren': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
