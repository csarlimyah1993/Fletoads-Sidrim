const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Encontrar todos os arquivos TypeScript no projeto
const files = glob.sync("**/*.{ts,tsx}", {
  ignore: ["node_modules/**", ".next/**", "out/**", "public/**"],
})

let fixedFiles = 0

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  const content = fs.readFileSync(filePath, "utf8")

  // Verificar se o arquivo contém @ts-ignore
  if (content.includes("@ts-ignore")) {
    // Substituir @ts-ignore por @ts-expect-error
    const newContent = content.replace(/\/\/ @ts-ignore/g, "// @ts-expect-error - Necessário para compatibilidade")

    fs.writeFileSync(filePath, newContent, "utf8")
    fixedFiles++
    console.log(`Corrigido: ${file}`)
  }
})

console.log(`Total de arquivos corrigidos: ${fixedFiles}`)

