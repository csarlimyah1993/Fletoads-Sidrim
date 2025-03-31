import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUsuario extends Document {
  nome: string
  email: string
  senha: string
  role: "admin" | "user" | "manager"
  ativo: boolean
  plano: string
  dataCriacao: Date
  ultimoLogin: Date
  verificado: boolean
  tokenVerificacao?: string
  tokenResetSenha?: string
  expiracaoTokenResetSenha?: Date
  avatar?: string
  telefone?: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  configuracoes?: {
    notificacoes: boolean
    tema: "claro" | "escuro" | "sistema"
    idioma: string
  }
  compararSenha(senhaFornecida: string): Promise<boolean>
}

const UsuarioSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
    },
    ativo: { type: Boolean, default: true },
    plano: { type: String, default: "gratuito" },
    dataCriacao: { type: Date, default: Date.now },
    ultimoLogin: { type: Date },
    verificado: { type: Boolean, default: false },
    tokenVerificacao: { type: String },
    tokenResetSenha: { type: String },
    expiracaoTokenResetSenha: { type: Date },
    avatar: { type: String },
    telefone: { type: String },
    endereco: {
      rua: { type: String },
      numero: { type: String },
      complemento: { type: String },
      bairro: { type: String },
      cidade: { type: String },
      estado: { type: String },
      cep: { type: String },
    },
    configuracoes: {
      notificacoes: { type: Boolean, default: true },
      tema: { type: String, enum: ["claro", "escuro", "sistema"], default: "sistema" },
      idioma: { type: String, default: "pt-BR" },
    },
  },
  {
    timestamps: true,
  },
)

// Método para comparar senhas
UsuarioSchema.methods.compararSenha = async function (senhaFornecida: string): Promise<boolean> {
  // Verificar se a senha armazenada é um hash bcrypt
  if (this.senha.startsWith("$2a$") || this.senha.startsWith("$2b$")) {
    return await bcrypt.compare(senhaFornecida, this.senha)
  } else {
    // Se não for um hash bcrypt, comparar diretamente
    return senhaFornecida === this.senha
  }
}

// Middleware para hash da senha antes de salvar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) return next()

  try {
    // Verificar se a senha já é um hash bcrypt
    if (this.senha.startsWith("$2a$") || this.senha.startsWith("$2b$")) {
      return next() // Se já for um hash, não fazer nada
    }

    const salt = await bcrypt.genSalt(10)
    // Corrigindo o tipo para garantir que senha seja uma string
    const senha = this.get("senha") as string
    this.senha = await bcrypt.hash(senha, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Verificar se o modelo já existe para evitar recompilação
const UsuarioModel = mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", UsuarioSchema)
export default UsuarioModel

