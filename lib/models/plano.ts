import mongoose, { Schema } from "mongoose"

// Interface para o modelo de Plano
export interface IPlano {
  nome: string
  descricao: string
  preco: number
  recursos: {
    [key: string]: boolean | number
  }
  limites: {
    [key: string]: number
  }
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

// Schema do Plano
const planoSchema = new Schema<IPlano>(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    recursos: { type: Schema.Types.Mixed, default: {} },
    limites: { type: Schema.Types.Mixed, default: {} },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// Exportar o modelo Plano
export const Plano = mongoose.models.Plano || mongoose.model<IPlano>("Plano", planoSchema)

