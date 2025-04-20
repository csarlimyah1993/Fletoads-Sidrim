import mongoose, { Schema, type Document } from "mongoose"

export interface IPanfleto extends Document {
  titulo: string
  descricao: string
  conteudo: string
  imagem: string
  categoria: string
  tags?: string[]
  preco?: number
  precoPromocional?: number
  tipo: string
  status: string
  dataInicio?: Date
  dataFim?: Date
  lojaId: mongoose.Types.ObjectId | string
  usuarioId: string
  dataCriacao: Date
  dataAtualizacao: Date
  visualizacoes?: number
  curtidas?: number
  compartilhamentos?: number
  comentarios?: number
  ativo?: boolean
  destaque?: boolean
  eventoId?: mongoose.Types.ObjectId | string
  botaoAcao?: string
  botaoLink?: string
  codigo?: string
}

const PanfletoSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  conteudo: { type: String, required: true },
  imagem: { type: String, required: true },
  categoria: { type: String, required: true },
  tags: [{ type: String }],
  preco: { type: Number },
  precoPromocional: { type: Number },
  tipo: { type: String, enum: ["ativo", "programado", "hotpromo", "evento"], default: "ativo" },
  status: { type: String, enum: ["draft", "active", "inactive", "scheduled"], default: "draft" },
  dataInicio: { type: Date },
  dataFim: { type: Date },
  lojaId: { type: Schema.Types.ObjectId, ref: "Loja", required: true },
  usuarioId: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now },
  visualizacoes: { type: Number, default: 0 },
  curtidas: { type: Number, default: 0 },
  compartilhamentos: { type: Number, default: 0 },
  comentarios: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  destaque: { type: Boolean, default: false },
  eventoId: { type: Schema.Types.ObjectId, ref: "Evento" },
  botaoAcao: { type: String },
  botaoLink: { type: String },
  codigo: { type: String },
})

// Verificar se o modelo já existe para evitar sobrescrita
export const Panfleto = mongoose.models.Panfleto || mongoose.model<IPanfleto>("Panfleto", PanfletoSchema)
