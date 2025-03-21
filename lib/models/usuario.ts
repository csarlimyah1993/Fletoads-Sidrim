import mongoose, { type Document, Schema } from "mongoose"

// Interface para o documento do usuário
export interface UsuarioDocument extends Document {
  nome: string
  email: string
  password: string
  cpf?: string
  plano?: string
  role?: string
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
    }
    redesSociais?: {
      instagram?: string
      facebook?: string
      linkedin?: string
      twitter?: string
    }
    preferencias?: {
      notificacoes?: boolean
      temaEscuro?: boolean
      idioma?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

// Verificar se o modelo já existe para evitar recompilação
const UsuarioSchema = new Schema<UsuarioDocument>(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cpf: { type: String },
    plano: { type: String, default: "free" },
    role: { type: String, default: "user" }, // Adicionando o campo role
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
      },
      redesSociais: {
        instagram: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
      },
      preferencias: {
        notificacoes: { type: Boolean, default: true },
        temaEscuro: { type: Boolean, default: false },
        idioma: { type: String, default: "pt-BR" },
      },
    },
  },
  { timestamps: true },
)

// Verificar se o modelo já existe para evitar recompilação
export const Usuario = mongoose.models.Usuario || mongoose.model<UsuarioDocument>("Usuario", UsuarioSchema)

