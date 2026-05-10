import prettier from 'eslint-plugin-prettier';

export default [
  {
    plugins: {
      prettier
    },

    rules: {
      semi: 'off',
      '@typescript-eslint/consistent-type-imports': 'off'
    }
  },
  {
    ignores: [
      '.husky',
      '__tests__',
      'node_modules',
      'lib',
      'migrations',
      '**/jest.config.js',
      '**/jest.setup.js',
      '**/migrate-mongo-config.js',
      '**/.DS_Store',
      '**/coverage'
    ]
  }
];
