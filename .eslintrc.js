module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: ['prettier'],
  rules: {
    "prettier/prettier": [
      "error",
      {
        "trailingComma": "none",
        "tabWidth": 2,
        "singleQuote": true,
        "arrowParens": "avoid"
      }
    ],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
      "experimentalObjectRestSpread": true
    }
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ]
}; 
