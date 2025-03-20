import mongoose, { Schema, type Document } from "mongoose"

export interface IProduto extends Document {
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  imagem: string
  categoria: string
  estoque: number
  ativo: boolean
  usuario: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProdutoSchema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    precoPromocional: { type: Number },
    imagem: { type: String, required: true },
    categoria: { type: String, required: true },
    estoque: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  },
  { timestamps: true },
)

export const Produto = mongoose.models.Produto || mongoose.model<IProduto>("Produto", ProdutoSchema)

