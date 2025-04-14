// Importar o módulo mongodb diretamente
const { MongoClient, ObjectId } = require("mongodb")

// Obter a URI do MongoDB das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:070794Rl!@168.228.4.84:27017/prod-db?authSource=admin"

async function connectToDatabase() {
  try {
    console.log("Conectando ao MongoDB...")
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })

    // Extrair o nome do banco de dados da URI
    const dbName = MONGODB_URI.split("/").pop().split("?")[0]
    console.log(`Nome do banco de dados: ${dbName}`)

    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

async function updateProductLojaIds() {
  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Buscar todas as lojas
    const lojas = await db.collection("lojas").find({}).toArray()
    console.log(`Encontradas ${lojas.length} lojas`)

    for (const loja of lojas) {
      const lojaId = loja._id.toString()
      console.log(`Processando loja: ${loja.nome} (${lojaId})`)

      // Buscar produtos associados a esta loja
      const produtos = await db.collection("produtos").find({ lojaId: lojaId }).toArray()
      console.log(`Encontrados ${produtos.length} produtos com lojaId correto`)

      // Buscar produtos que possam estar associados ao vitrineId
      if (loja.vitrineId) {
        const produtosComVitrineId = await db.collection("produtos").find({ lojaId: loja.vitrineId }).toArray()
        console.log(`Encontrados ${produtosComVitrineId.length} produtos com vitrineId como lojaId`)

        // Atualizar os produtos para usar o lojaId correto
        if (produtosComVitrineId.length > 0) {
          for (const produto of produtosComVitrineId) {
            console.log(`Atualizando produto: ${produto.nome} (${produto._id})`)
            await db.collection("produtos").updateOne({ _id: produto._id }, { $set: { lojaId: lojaId } })
          }
          console.log(`${produtosComVitrineId.length} produtos atualizados para lojaId: ${lojaId}`)
        }
      }

      // Buscar produtos que possam estar relacionados à vitrine.slug
      if (loja.vitrine && loja.vitrine.slug) {
        const produtosComSlug = await db.collection("produtos").find({ lojaId: loja.vitrine.slug }).toArray()
        console.log(`Encontrados ${produtosComSlug.length} produtos com vitrine.slug como lojaId`)

        // Atualizar os produtos para usar o lojaId correto
        if (produtosComSlug.length > 0) {
          for (const produto of produtosComSlug) {
            console.log(`Atualizando produto: ${produto.nome} (${produto._id})`)
            await db.collection("produtos").updateOne({ _id: produto._id }, { $set: { lojaId: lojaId } })
          }
          console.log(`${produtosComSlug.length} produtos atualizados para lojaId: ${lojaId}`)
        }
      }
    }

    console.log("Processo concluído com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar produtos:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Conexão com o MongoDB fechada.")
    }
  }
}

// Executar o script
updateProductLojaIds()
