import mongoose, { Schema } from "mongoose"

// Define o esquema para o modelo Produto
const ProdutoSchema = new Schema({
  nome: {
    type: String,
    required: [true, "O nome é obrigatório"],
    trim: true,
  },
  descricao: {
    type: String,
    required: [true, "A descrição é obrigatória"],
    trim: true,
  },
  preco: {
    type: Number,
    required: [true, "O preço é obrigatório"],
    min: [0, "O preço não pode ser negativo"],
  },
  imagem: {
    type: String,
    required: [true, "A imagem é obrigatória"],
  },
  categoria: {
    type: String,
    required: [true, "A categoria é obrigatória"],
    trim: true,
  },
  estoque: {
    type: Number,
    required: [true, "O estoque é obrigatório"],
    min: [0, "O estoque não pode ser negativo"],
  },
  userId: {
    type: String,
    required: [true, "O ID do usuário é obrigatório"],
  },
  status: {
    type: String,
    enum: ["ativo", "inativo"],
    default: "ativo",
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
})

// Verifica se o modelo já existe para evitar recompilação
export const Produto = mongoose.models.Produto || mongoose.model("Produto", ProdutoSchema)

