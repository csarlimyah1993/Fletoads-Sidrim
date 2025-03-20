import mongoose, { Schema } from "mongoose"

export interface IPromocao {
  titulo: string
  descricao: string
  desconto: number
  dataInicio: Date
  dataFim: Date
  ativo: boolean
  usuario: mongoose.Types.ObjectId
  produtos: mongoose.Types.ObjectId[]
}

const PromocaoSchema = new Schema<IPromocao>(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    desconto: { type: Number, required: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, required: true },
    ativo: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    produtos: [{ type: Schema.Types.ObjectId, ref: "Produto" }],
  },
  { timestamps: true },
)

export default mongoose.models.Promocao || mongoose.model<IPromocao>("Promocao", PromocaoSchema)

