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
    instagram?: string
    facebook?: string
    site?: string
  }
  categorias: string[]
  horarioFuncionamento: {
    segunda?: string
    terca?: string
    quarta?: string
    quinta?: string
    sexta?: string
    sabado?: string
    domingo?: string
  }
  proprietarioId: mongoose.Types.ObjectId
  dataCriacao: Date
  dataAtualizacao: Date
  status: "ativo" | "inativo" | "pendente"
}

const LojaSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
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
      instagram: { type: String },
      facebook: { type: String },
      site: { type: String },
    },
    categorias: [{ type: String }],
    horarioFuncionamento: {
      segunda: { type: String },
      terca: { type: String },
      quarta: { type: String },
      quinta: { type: String },
      sexta: { type: String },
      sabado: { type: String },
      domingo: { type: String },
    },
    proprietarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    status: {
      type: String,
      enum: ["ativo", "inativo", "pendente"],
      default: "pendente",
    },
  },
  {
    timestamps: {
      createdAt: "dataCriacao",
      updatedAt: "dataAtualizacao",
    },
  },
)

export default mongoose.models.Loja || mongoose.model<ILoja>("Loja", LojaSchema)

