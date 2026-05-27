export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-empty': [2, 'never'],
    'body-empty': [2, 'never'],
    'body-min-length': [2, 'always', 2],
  },
};
