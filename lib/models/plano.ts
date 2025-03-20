import mongoose, { Schema, type Document } from "mongoose"
import type { ResourceLimits } from "./resource-limits"

export interface IPlano extends Document {
  nome: string
  descricao: string
  preco: number
  nivel: "free" | "start" | "pro" | "business" | "enterprise"
  limites: ResourceLimits
  createdAt: Date
  updatedAt: Date
}

const PlanoSchema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    nivel: {
      type: String,
      enum: ["free", "start", "pro", "business", "enterprise"],
      default: "free",
    },
    limites: {
      panfletos: { type: Number, required: true },
      produtos: { type: Number, required: true },
      campanhas: { type: Number, default: 0 },
      clientes: { type: Number, default: 0 },
      integracoes: { type: Number, default: 0 },
      armazenamento: { type: Number, default: 0 }, // em KB
      panAssistant: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      clientesProximos: { type: Boolean, default: false },
      sinalizacaoVisual: { type: Boolean, default: false },
      notificacoes: { type: Boolean, default: false },
      vitrine: { type: Boolean, default: false },
      hotPromos: { type: Boolean, default: false },
      vendas: { type: Boolean, default: false },
      suporte: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

export const Plano = mongoose.models.Plano || mongoose.model<IPlano>("Plano", PlanoSchema)

