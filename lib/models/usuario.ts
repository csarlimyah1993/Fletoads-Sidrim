import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUsuario extends Document {
  nome: string
  email: string
  senha: string
  cargo: string
  permissoes: string[]
  dataCriacao: Date
  ultimoLogin: Date
  ativo: boolean
  plano?: string
  perfil: {
    foto: string
    telefone: string
    bio: string
    endereco?: {
      rua: string
      numero: string
      complemento?: string
      bairro: string
      cidade: string
      estado: string
      cep: string
    }
    redesSociais?: {
      instagram?: string
      facebook?: string
      linkedin?: string
      twitter?: string
    }
    preferencias?: {
      notificacoes: boolean
      temaEscuro: boolean
      idioma: string
    }
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UsuarioSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cargo: { type: String, default: "editor" },
    permissoes: [{ type: String }],
    dataCriacao: { type: Date, default: Date.now },
    ultimoLogin: { type: Date },
    ativo: { type: Boolean, default: true },
    plano: { type: String, default: "gratuito" },
    perfil: {
      foto: { type: String, default: "" },
      telefone: { type: String, default: "" },
      bio: { type: String, default: "" },
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
  {
    timestamps: true,
  },
)

// Método para hash da senha antes de salvar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    // Garantir que this.senha é uma string
    const senhaString = String(this.senha)
    this.senha = await bcrypt.hash(senhaString, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Método para comparar senhas
UsuarioSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.senha)
}

export default mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", UsuarioSchema)

