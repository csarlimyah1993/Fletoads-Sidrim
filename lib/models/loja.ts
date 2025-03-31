import mongoose, { Schema, type Document } from "mongoose"

export interface ILoja extends Document {
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
  }
  redesSociais?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  horarioFuncionamento: {
    segunda?: { abertura: string; fechamento: string }
    terca?: { abertura: string; fechamento: string }
    quarta?: { abertura: string; fechamento: string }
    quinta?: { abertura: string; fechamento: string }
    sexta?: { abertura: string; fechamento: string }
    sabado?: { abertura: string; fechamento: string }
    domingo?: { abertura: string; fechamento: string }
  }
  categorias: string[]
  ativo: boolean
  destaque: boolean
  dataCriacao: Date
  dataAtualizacao: Date
  proprietarioId: mongoose.Schema.Types.ObjectId
}

const LojaSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    logo: { type: String, required: true },
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
    },
    redesSociais: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
    },
    horarioFuncionamento: {
      segunda: { abertura: String, fechamento: String },
      terca: { abertura: String, fechamento: String },
      quarta: { abertura: String, fechamento: String },
      quinta: { abertura: String, fechamento: String },
      sexta: { abertura: String, fechamento: String },
      sabado: { abertura: String, fechamento: String },
      domingo: { abertura: String, fechamento: String },
    },
    categorias: [{ type: String }],
    ativo: { type: Boolean, default: true },
    destaque: { type: Boolean, default: false },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
    proprietarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  },
  {
    timestamps: true,
  },
)

const LojaModel = mongoose.models.Loja || mongoose.model<ILoja>("Loja", LojaSchema)
export default LojaModel

