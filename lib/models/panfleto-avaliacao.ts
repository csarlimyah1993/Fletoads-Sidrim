import mongoose from "mongoose"
import { ObjectId } from "mongodb"

// Definir o schema para avaliações de panfletos
const PanfletoAvaliacaoSchema = new mongoose.Schema({
  panfletoId: {
    type: ObjectId,
    required: true,
    ref: "Panfleto",
  },
  lojaId: {
    type: ObjectId,
    required: true,
    ref: "Loja",
  },
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comentario: {
    type: String,
    required: true,
  },
  usuarioId: {
    type: String,
    required: false,
  },
  data: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pendente", "aprovado", "rejeitado"],
    default: "aprovado",
  },
  resposta: {
    type: String,
    required: false,
  },
  dataResposta: {
    type: Date,
    required: false,
  },
})

// Verificar se o modelo já existe para evitar redefinição
export const PanfletoAvaliacao =
  mongoose.models.PanfletoAvaliacao || mongoose.model("PanfletoAvaliacao", PanfletoAvaliacaoSchema)
