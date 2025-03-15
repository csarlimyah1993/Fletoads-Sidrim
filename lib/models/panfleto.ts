import mongoose, { Schema, type Document } from "mongoose"

export interface IPanfleto extends Document {
  titulo: string
  descricao: string
  imagem: string
  conteudo: string
  categoria: string
  tags: string[]
  dataPublicacao: Date
  dataAtualizacao: Date
  status: "rascunho" | "publicado" | "arquivado"
  autor: string
  visualizacoes: number
  compartilhamentos: number
}

const PanfletoSchema: Schema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    imagem: { type: String, required: true },
    conteudo: { type: String, required: true },
    categoria: { type: String, required: true },
    tags: [{ type: String }],
    dataPublicacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["rascunho", "publicado", "arquivado"],
      default: "rascunho",
    },
    autor: { type: String, required: true },
    visualizacoes: { type: Number, default: 0 },
    compartilhamentos: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

// Verificar se o modelo já existe para evitar erros de sobrescrita
export default mongoose.models.Panfleto || mongoose.model<IPanfleto>("Panfleto", PanfletoSchema)

