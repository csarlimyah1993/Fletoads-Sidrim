import mongoose, { Schema, type Document } from "mongoose"

export interface IUsuario extends Document {
  nome: string
  email: string
  senha?: string
  role: string
  plano?: string
  dataExpiracaoPlano?: Date
  perfil?: {
    foto?: string
    telefone?: string
    bio?: string
    endereco?: {
      rua?: string
      numero?: string
      complemento?: string
      bairro?: string
      cidade?: string
      estado?: string
      cep?: string
      latitude?: number
      longitude?: number
    }
    redesSociais?: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
      youtube?: string
      tiktok?: string
    }
    preferencias?: {
      notificacoes?: boolean
      newsletter?: boolean
      tema?: string
    }
  }
  ativo: boolean
  dataCriacao: Date
  dataAtualizacao: Date
  ultimoLogin?: Date
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String },
    role: { type: String, default: "user" },
    plano: { type: String, default: "gratuito" },
    dataExpiracaoPlano: { type: Date },
    perfil: {
      foto: { type: String },
      telefone: { type: String },
      bio: { type: String },
      endereco: {
        rua: { type: String },
        numero: { type: String },
        complemento: { type: String },
        bairro: { type: String },
        cidade: { type: String },
        estado: { type: String },
        cep: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
      redesSociais: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
      },
      preferencias: {
        notificacoes: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
        tema: { type: String, default: "light" },
      },
    },
    ativo: { type: Boolean, default: true },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
    ultimoLogin: { type: Date },
  },
  { timestamps: { createdAt: "dataCriacao", updatedAt: "dataAtualizacao" } },
)

// Verificar se o modelo já foi compilado para evitar erros de sobrescrita
const Usuario = mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", UsuarioSchema)

export default Usuario
