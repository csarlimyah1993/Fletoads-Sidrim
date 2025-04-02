import mongoose, { Schema, type Document } from "mongoose"

export interface IVitrine extends Document {
  lojaId: mongoose.Schema.Types.ObjectId
  usuarioId: mongoose.Schema.Types.ObjectId
  nome: string
  descricao: string
  logo: string
  banner: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  contato: {
    telefone: string
    email: string
    whatsapp?: string
    site?: string
  }
  redesSociais?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  categorias: string[]
  produtos: mongoose.Schema.Types.ObjectId[]
  ativo: boolean
  destaque: boolean
  dataCriacao: Date
  dataAtualizacao: Date
}

const VitrineSchema: Schema = new Schema(
  {
    lojaId: { type: mongoose.Schema.Types.ObjectId, ref: "Loja" },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    logo: { type: String },
    banner: { type: String },
    endereco: {
      rua: { type: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      estado: { type: String, required: true },
      cep: { type: String, required: true },
    },
    contato: {
      telefone: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp: { type: String },
      site: { type: String },
    },
    redesSociais: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
    },
    categorias: [{ type: String }],
    produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Produto" }],
    ativo: { type: Boolean, default: true },
    destaque: { type: Boolean, default: false },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

const VitrineModel = mongoose.models.Vitrine || mongoose.model<IVitrine>("Vitrine", VitrineSchema)
export default VitrineModel

