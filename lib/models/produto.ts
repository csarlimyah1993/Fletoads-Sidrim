import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IProduto extends Document {
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  categoria: string
  sku: string
  estoque: number
  imagens: string[]
  destaque: boolean
  ativo: boolean
  lojaId: mongoose.Types.ObjectId
  criadoEm: Date
  atualizadoEm: Date
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
    imagens: { type: [String], default: [] },
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
    lojaId: { type: Schema.Types.ObjectId, ref: "Loja", required: true },
    criadoEm: { type: Date, default: Date.now },
    atualizadoEm: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
  },
)

// Índices para melhorar a performance das consultas
ProdutoSchema.index({ nome: 1 })
ProdutoSchema.index({ categoria: 1 })
ProdutoSchema.index({ sku: 1 }, { unique: true })
ProdutoSchema.index({ lojaId: 1 })
ProdutoSchema.index({ destaque: 1 })
ProdutoSchema.index({ ativo: 1 })

// Verificar se o modelo já existe para evitar redefinição
const Produto: Model<IProduto> = mongoose.models.Produto || mongoose.model<IProduto>("Produto", ProdutoSchema)

export default Produto

