import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ICampanha extends Document {
  nome: string
  descricao: string
  dataInicio: Date
  dataFim: Date
  status: "planejada" | "em_andamento" | "concluida" | "cancelada"
  orcamento: number
  panfletos: Types.ObjectId[]
  clientes: Types.ObjectId[]
  responsavel: Types.ObjectId
  metricas: {
    alcance: number
    conversoes: number
    roi: number
  }
}

const CampanhaSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planejada", "em_andamento", "concluida", "cancelada"],
      default: "planejada",
    },
    orcamento: { type: Number, default: 0 },
    panfletos: [{ type: Schema.Types.ObjectId, ref: "Panfleto" }],
    clientes: [{ type: Schema.Types.ObjectId, ref: "Cliente" }],
    responsavel: { type: Schema.Types.ObjectId, ref: "Usuario" },
    metricas: {
      alcance: { type: Number, default: 0 },
      conversoes: { type: Number, default: 0 },
      roi: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Campanha || mongoose.model<ICampanha>("Campanha", CampanhaSchema)

