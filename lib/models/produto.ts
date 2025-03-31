import mongoose, { Schema, type Document } from "mongoose"

export interface IProduto extends Document {
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  imagens: string[]
  categoria: string
  subcategoria?: string
  tags: string[]
  estoque: number
  sku: string
  peso?: number
  dimensoes?: {
    altura?: number
    largura?: number
    comprimento?: number
  }
  destaque: boolean
  ativo: boolean
  dataCriacao: Date
  dataAtualizacao: Date
  lojaId: mongoose.Schema.Types.ObjectId
  avaliacoes?: {
    usuario: mongoose.Schema.Types.ObjectId
    nota: number
    comentario: string
    data: Date
  }[]
}

const ProdutoSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    precoPromocional: { type: Number },
    imagens: [{ type: String, required: true }],
    categoria: { type: String, required: true },
    subcategoria: { type: String },
    tags: [{ type: String }],
    estoque: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    peso: { type: Number },
    dimensoes: {
      altura: { type: Number },
      largura: { type: Number },
      comprimento: { type: Number },
    },
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
    lojaId: { type: mongoose.Schema.Types.ObjectId, ref: "Loja", required: true },
    avaliacoes: [
      {
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        nota: { type: Number, required: true, min: 1, max: 5 },
        comentario: { type: String },
        data: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const ProdutoModel = mongoose.models.Produto || mongoose.model<IProduto>("Produto", ProdutoSchema)
export default ProdutoModel

