import mongoose, { Schema, type Document } from "mongoose"

export interface LojaDocument extends Document {
  usuarioId: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  endereco?: string
  telefone?: string
  email?: string
  website?: string
  horarioFuncionamento?: string
  dataFundacao?: string
  numeroFuncionarios?: number
  tags?: string[]
  redesSociais?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  createdAt: Date
  updatedAt: Date
}

const LojaSchema = new Schema(
  {
    usuarioId: { type: String, required: true },
    nome: { type: String, required: true },
    descricao: { type: String },
    logo: { type: String },
    banner: { type: String },
    endereco: { type: String },
    telefone: { type: String },
    email: { type: String },
    website: { type: String },
    horarioFuncionamento: { type: String },
    dataFundacao: { type: String },
    numeroFuncionarios: { type: Number },
    tags: { type: [String], default: [] },
    redesSociais: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
    },
  },
  { timestamps: true },
)

// Verificar se o modelo já existe para evitar redefinição
export const Loja = mongoose.models.Loja || mongoose.model<LojaDocument>("Loja", LojaSchema)

