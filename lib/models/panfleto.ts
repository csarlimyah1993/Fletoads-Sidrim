import mongoose, { Schema, type Document } from "mongoose"

export interface IPanfleto extends Document {
  titulo: string
  descricao: string
  imagem: string
  dataInicio: Date
  dataFim: Date
  ativo: boolean
  usuario: mongoose.Types.ObjectId
  produtos: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PanfletoSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    imagem: { type: String, required: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, required: true },
    ativo: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    produtos: [{ type: Schema.Types.ObjectId, ref: "Produto" }],
  },
  { timestamps: true },
)

export const Panfleto = mongoose.models.Panfleto || mongoose.model<IPanfleto>("Panfleto", PanfletoSchema)

