import mongoose, { Schema } from "mongoose"

// Define o esquema para o modelo Panfleto
const PanfletoSchema = new Schema({
  titulo: {
    type: String,
    required: [true, "O título é obrigatório"],
    trim: true,
  },
  descricao: {
    type: String,
    required: [true, "A descrição é obrigatória"],
    trim: true,
  },
  imagem: {
    type: String,
    required: [true, "A imagem é obrigatória"],
  },
  dataPublicacao: {
    type: Date,
    default: Date.now,
  },
  dataValidade: {
    type: Date,
    required: [true, "A data de validade é obrigatória"],
  },
  userId: {
    type: String,
    required: [true, "O ID do usuário é obrigatório"],
  },
  status: {
    type: String,
    enum: ["ativo", "inativo", "expirado"],
    default: "ativo",
  },
})

// Verifica se o modelo já existe para evitar recompilação
export const Panfleto = mongoose.models.Panfleto || mongoose.model("Panfleto", PanfletoSchema)

