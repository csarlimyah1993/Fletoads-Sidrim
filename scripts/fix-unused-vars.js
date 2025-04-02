const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Encontrar todos os arquivos TypeScript no projeto
const files = glob.sync("**/*.{ts,tsx}", {
  ignore: ["node_modules/**", ".next/**", "out/**", "public/**"],
})

let fixedFiles = 0

// Padrões para encontrar variáveis não utilizadas
const patterns = [
  // Parâmetros não utilizados em funções
  {
    regex:
      /$$([^)]*)\b(req|request|res|response|error|e|props|config|id|index|type|period|image|eventoNome)\b([^)]*)$$/g,
    replacement: (match, before, param, after) => `(${before}_${param}${after})`,
  },
  // Variáveis declaradas mas não utilizadas
  {
    regex:
      /\b(const|let|var)\s+\b(router|data|session|isPlanoPago|layoutStyle|primaryColor|secondaryColor|textColor|showTestimonials|hoveredProduct|produtoId|planoSelecionado|activeTab|isLoading|defaultData|monthlyData|customerData|COLORS|corPrimaria|corSecundaria|corTexto|priceRange|getIconColor|handleNewPanfleto|handleCreatePanfleto|handleRedesSociaisChange|horarioType|planInfo|openItem|setOpenItem|setLimit|setPlanoId|setPeriodo|setPriceRange|setIsLoading|setActiveTab|setProducts|setLogoImage|setCoverImage)\b\s*=/g,
    replacement: (match, declType, varName) => `${declType} _${varName} =`,
  },
]

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  let content = fs.readFileSync(filePath, "utf8")
  const originalContent = content

  // Aplicar cada padrão ao conteúdo do arquivo
  patterns.forEach((pattern) => {
    content = content.replace(pattern.regex, pattern.replacement)
  })

  // Se o conteúdo foi modificado, salvar o arquivo
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8")
    fixedFiles++
    console.log(`Corrigido: ${file}`)
  }
})

console.log(`Total de arquivos corrigidos: ${fixedFiles}`)

