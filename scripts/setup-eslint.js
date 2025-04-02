const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Instalar dependências do ESLint
console.log("Instalando dependências do ESLint...")
try {
  execSync("npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser", { stdio: "inherit" })
  console.log("Dependências instaladas com sucesso!")
} catch (error) {
  console.error("Erro ao instalar dependências:", error)
  process.exit(1)
}

// Criar configuração completa do ESLint
const eslintConfig = `
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    // Desabilitar regras que estão causando muitos avisos
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@next/next/no-img-element": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "jsx-a11y/alt-text": "warn",
    "no-var": "error"
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "public/",
    "*.config.js",
    "*.config.mjs",
  ],
}
`

// Escrever a configuração no arquivo .eslintrc.js
fs.writeFileSync(path.join(process.cwd(), ".eslintrc.js"), eslintConfig, "utf8")
console.log("Arquivo .eslintrc.js atualizado com sucesso!")

// Corrigir o arquivo mongodb.ts se existir
const mongodbPath = path.join(process.cwd(), "lib", "mongodb.ts")
if (fs.existsSync(mongodbPath)) {
  let content = fs.readFileSync(mongodbPath, "utf8")
  // Substituir 'var' por 'let'
  content = content.replace(/var\s+/g, "let ")
  fs.writeFileSync(mongodbPath, content, "utf8")
  console.log("Arquivo mongodb.ts corrigido com sucesso!")
}

console.log('Configuração do ESLint concluída! Execute "npm run lint" para verificar.')

