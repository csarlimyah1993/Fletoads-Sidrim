const { execSync } = require("child_process")

console.log("Iniciando correção de problemas de ESLint...")

try {
  // Configurar ESLint
  console.log("\n1. Configurando ESLint...")
  execSync("node scripts/setup-eslint.js", { stdio: "inherit" })

  // Instalar glob se necessário
  console.log("\n2. Instalando dependências...")
  execSync("npm install --save-dev glob", { stdio: "inherit" })

  // Corrigir comentários TS
  console.log("\n3. Corrigindo comentários TypeScript...")
  execSync("node scripts/fix-ts-comments.js", { stdio: "inherit" })

  // Corrigir variáveis não utilizadas
  console.log("\n4. Corrigindo variáveis não utilizadas...")
  execSync("node scripts/fix-unused-vars.js", { stdio: "inherit" })

  console.log('\nTodas as correções foram aplicadas! Execute "npm run lint" para verificar.')
} catch (error) {
  console.error("Erro durante o processo de correção:", error)
  process.exit(1)
}

