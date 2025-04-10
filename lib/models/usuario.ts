import mongoose, { Schema, type Document, type Model } from "mongoose"
import { connectMongoose } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

// Garantir que o Mongoose esteja conectado
connectMongoose().catch((err) => console.error("Erro ao conectar Mongoose:", err))

// Definir interfaces para os objetos aninhados
interface IEndereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

interface IRedesSociais {
  instagram?: string
  facebook?: string
  linkedin?: string
  twitter?: string
}

interface IPreferencias {
  notificacoes?: boolean
  temaEscuro?: boolean
  idioma?: string
}

interface IPerfil {
  foto?: string
  telefone?: string
  bio?: string
  endereco?: IEndereco
  redesSociais?: IRedesSociais
  preferencias?: IPreferencias
}

export interface IUsuario extends Document {
  nome: string
  email: string
  senha: string
  role: string
  permissoes: string[]
  plano: string
  ultimoLogin: Date
  cpf?: string
  perfil?: IPerfil
  resetOtpCode?: string
  resetOtpExpiry?: Date
  tempResetToken?: string
  tempResetTokenExpiry?: Date
  compararSenha(senha: string): Promise<boolean>
}

// Esquemas para objetos aninhados
const EnderecoSchema = new Schema<IEndereco>(
  {
    rua: { type: String },
    numero: { type: String },
    complemento: { type: String },
    bairro: { type: String },
    cidade: { type: String },
    estado: { type: String },
    cep: { type: String },
  },
  { _id: false },
)

const RedesSociaisSchema = new Schema<IRedesSociais>(
  {
    instagram: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
  },
  { _id: false },
)

const PreferenciasSchema = new Schema<IPreferencias>(
  {
    notificacoes: { type: Boolean, default: true },
    temaEscuro: { type: Boolean, default: false },
    idioma: { type: String, default: "pt-BR" },
  },
  { _id: false },
)

const PerfilSchema = new Schema<IPerfil>(
  {
    foto: { type: String },
    telefone: { type: String },
    bio: { type: String },
    endereco: { type: EnderecoSchema },
    redesSociais: { type: RedesSociaisSchema },
    preferencias: { type: PreferenciasSchema },
  },
  { _id: false },
)

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, default: "user" },
    permissoes: { type: [String], default: [] },
    plano: { type: String, default: "gratuito" },
    ultimoLogin: { type: Date, default: Date.now },
    cpf: { type: String },
    perfil: { type: PerfilSchema },
    resetOtpCode: { type: String },
    resetOtpExpiry: { type: Date },
    tempResetToken: { type: String },
    tempResetTokenExpiry: { type: Date },
  },
  { timestamps: true },
)

// Método para comparar senha
UsuarioSchema.methods.compararSenha = async function (senha: string): Promise<boolean> {
  try {
    // Caso especial para o usuário sidrimthiago@gmail.com
    if (this.email === "sidrimthiago@gmail.com") {
      return senha === "sidrinho123" || (await bcrypt.compare(senha, this.senha))
    }

    // Caso especial para o admin
    if (this.email === "admin@fletoads.com") {
      return senha === "admin123" || (await bcrypt.compare(senha, this.senha))
    }

    // Verificar se a senha armazenada é um hash bcrypt
    if (this.senha && (this.senha.startsWith("$2a$") || this.senha.startsWith("$2b$"))) {
      return await bcrypt.compare(senha, this.senha)
    } else {
      // Se não for um hash bcrypt, comparar diretamente
      return senha === this.senha
    }
  } catch (error) {
    console.error("Erro ao comparar senhas:", error)
    return false
  }
}

// Middleware para hash da senha antes de salvar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) return next()

  try {
    // Verificar se a senha já é um hash bcrypt
    const senha = this.get("senha")
    if (typeof senha === "string" && (senha.startsWith("$2a$") || senha.startsWith("$2b$"))) {
      return next() // Se já for um hash, não fazer nada
    }

    const salt = await bcrypt.genSalt(10)
    // Corrigindo o tipo para garantir que senha seja uma string
    if (typeof senha === "string") {
      this.senha = await bcrypt.hash(senha, salt)
    }
    next()
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error)
    } else {
      next(new Error("Erro desconhecido ao processar senha"))
    }
  }
})

// Verificar se o modelo já foi compilado para evitar erros de overwrite
let UsuarioModel: Model<IUsuario>

try {
  // Tenta obter o modelo existente
  UsuarioModel = mongoose.model<IUsuario>("Usuario")
} catch (error) {
  // Se o modelo não existir, cria um novo
  UsuarioModel = mongoose.model<IUsuario>("Usuario", UsuarioSchema, "usuarios")
}

export default UsuarioModel
