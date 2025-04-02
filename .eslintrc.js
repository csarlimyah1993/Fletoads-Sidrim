module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Regras básicas que não dependem de plugins externos
    "no-var": "error",
    "no-unused-vars": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "warn",
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "public/", "*.config.js", "*.config.mjs"],
}

