import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ILoja extends Document {
  _id: Types.ObjectId
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  capa?: string
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
    logradouro?: string
  }
  contato?: {
    telefone?: string
    whatsapp?: string
    email?: string
    site?: string
  }
  horarioFuncionamento?: {
    segunda?: string | { open?: boolean; abertura?: string; fechamento?: string }
    terca?: string | { open?: boolean; abertura?: string; fechamento?: string }
    quarta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    quinta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    sexta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    sabado?: string | { open?: boolean; abertura?: string; fechamento?: string }
    domingo?: string | { open?: boolean; abertura?: string; fechamento?: string }
  }
  vitrineId?: string
  proprietarioId?: string | Types.ObjectId
  usuarioId?: string | Types.ObjectId
  userId?: string | Types.ObjectId
  categorias?: string[]
  status?: string
  ativo?: boolean
  plano?: string
  planoId?: string
  proprietarioPlano?: string
  vitrine?: any
  telefone?: string
  email?: string
  website?: string
  site?: string
  instagram?: string
  facebook?: string
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  cores?: {
    primaria?: string
    secundaria?: string
    texto?: string
    fundo?: string
    destaque?: string
  }
  widgets?: string[]
  layout?: string
  fonte?: string
  animacoes?: boolean
  dataCriacao?: Date
  dataAtualizacao?: Date
}

const LojaSchema: Schema = new Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  logo: { type: String },
  banner: { type: String },
  capa: { type: String },
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
    logradouro: { type: String },
  },
  contato: {
    telefone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    site: { type: String },
  },
  horarioFuncionamento: {
    segunda: { type: Schema.Types.Mixed },
    terca: { type: Schema.Types.Mixed },
    quarta: { type: Schema.Types.Mixed },
    quinta: { type: Schema.Types.Mixed },
    sexta: { type: Schema.Types.Mixed },
    sabado: { type: Schema.Types.Mixed },
    domingo: { type: Schema.Types.Mixed },
  },
  vitrineId: { type: String },
  proprietarioId: { type: Schema.Types.Mixed },
  usuarioId: { type: Schema.Types.Mixed },
  userId: { type: Schema.Types.Mixed },
  categorias: [{ type: String }],
  status: { type: String },
  ativo: { type: Boolean, default: true },
  plano: { type: String },
  planoId: { type: String },
  proprietarioPlano: { type: String },
  vitrine: { type: Schema.Types.Mixed },
  telefone: { type: String },
  email: { type: String },
  website: { type: String },
  site: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  redesSociais: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
  },
  cores: {
    primaria: { type: String },
    secundaria: { type: String },
    texto: { type: String },
    fundo: { type: String },
    destaque: { type: String },
  },
  widgets: [{ type: String }],
  layout: { type: String },
  fonte: { type: String },
  animacoes: { type: Boolean },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now },
})

export const Loja = mongoose.models.Loja || mongoose.model<ILoja>("Loja", LojaSchema)
export default Loja