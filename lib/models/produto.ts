import mongoose, { Schema, type Document } from "mongoose"

export interface IProduto extends Document {
  nome: string
  descricaoCurta?: string
  descricaoCompleta?: string
  preco: number
  precoPromocional?: number
  estoque: number
  sku?: string
  codigoBarras?: string
  imagens: string[]
  videoUrl?: string
  categoria?: string
  subcategoria?: string
  tags?: string[]
  marca?: string
  modelo?: string
  peso?: number
  altura?: number
  largura?: number
  comprimento?: number
  tipoFrete?: string
  ativo: boolean
  destaque?: boolean
  tipoProduto?: string
  variacoes?: Array<{
    nome: string
    opcoes: Array<{
      nome: string
      preco?: number
      estoque?: number
    }>
  }>
  lojaId: mongoose.Types.ObjectId
  userId: string
  dataCriacao: Date
  dataAtualizacao?: Date
}

const ProdutoSchema = new Schema<IProduto>(
  {
    nome: { type: String, required: true },
    descricaoCurta: { type: String },
    descricaoCompleta: { type: String },
    preco: { type: Number, required: true },
    precoPromocional: { type: Number },
    estoque: { type: Number, required: true, default: 0 },
    sku: { type: String },
    codigoBarras: { type: String },
    imagens: { type: [String], default: [] },
    videoUrl: { type: String },
    categoria: { type: String },
    subcategoria: { type: String },
    tags: { type: [String], default: [] },
    marca: { type: String },
    modelo: { type: String },
    peso: { type: Number },
    altura: { type: Number },
    largura: { type: Number },
    comprimento: { type: Number },
    tipoFrete: { type: String, default: "padrao" },
    ativo: { type: Boolean, default: true },
    destaque: { type: Boolean, default: false },
    tipoProduto: { type: String, default: "fisico" },
    variacoes: [
      {
        nome: { type: String, required: true },
        opcoes: [
          {
            nome: { type: String, required: true },
            preco: { type: Number },
            estoque: { type: Number },
          },
        ],
      },
    ],
    lojaId: { type: Schema.Types.ObjectId, ref: "Loja", required: true },
    userId: { type: String, required: true },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date },
  },
  {
    timestamps: { createdAt: "dataCriacao", updatedAt: "dataAtualizacao" },
  },
)

// Índices para melhorar a performance das consultas
ProdutoSchema.index({ nome: "text", descricaoCurta: "text", descricaoCompleta: "text" })
ProdutoSchema.index({ lojaId: 1 })
ProdutoSchema.index({ userId: 1 })
ProdutoSchema.index({ categoria: 1 })
ProdutoSchema.index({ tags: 1 })
ProdutoSchema.index({ ativo: 1 })
ProdutoSchema.index({ destaque: 1 })

// Verificar se o modelo já existe para evitar erros de sobrescrita
const ProdutoModel = mongoose.models.Produto || mongoose.model<IProduto>("Produto", ProdutoSchema)

export default ProdutoModel
