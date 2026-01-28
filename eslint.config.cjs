/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['docs/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Event: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',

        // Timers & animation
        setTimeout: 'readonly',
        setInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        getComputedStyle: 'readonly',

        // App globals (defined via HTML or build-time injection)
        GEMINI_ENABLED: 'readonly',
        GEMINI_API_KEY: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': ['error', { args: 'none' }]
    }
  }
];

