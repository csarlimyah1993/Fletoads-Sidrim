import mongoose, { Schema, type Document } from "mongoose"

export interface IProduto extends Document {
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  categoria: string
  sku: string
  estoque: number
  destaque: boolean
  ativo: boolean
  imagens: string[]
  lojaId: mongoose.Types.ObjectId
  dataCriacao: Date
  dataAtualizacao: Date
}

const ProdutoSchema = new Schema<IProduto>(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    precoPromocional: { type: Number },
    categoria: { type: String, required: true },
    sku: { type: String, required: true },
    estoque: { type: Number, required: true, default: 0 },
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
    imagens: { type: [String], default: [] },
    lojaId: { type: Schema.Types.ObjectId, ref: "Loja", required: true },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "dataCriacao",
      updatedAt: "dataAtualizacao",
    },
  },
)

// Índices para melhorar a performance das consultas
ProdutoSchema.index({ nome: 1 })
ProdutoSchema.index({ categoria: 1 })
ProdutoSchema.index({ lojaId: 1 })
ProdutoSchema.index({ sku: 1 }, { unique: true })

export default mongoose.models.Produto || mongoose.model<IProduto>("Produto", ProdutoSchema)

