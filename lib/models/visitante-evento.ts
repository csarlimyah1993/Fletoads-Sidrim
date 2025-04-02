import mongoose, { Schema, type Document } from "mongoose"

export interface IVisitanteEvento extends Document {
  nome: string
  email: string
  telefone: string
  cpf: string
  token: string
  visitasLojas: {
    lojaId: mongoose.Schema.Types.ObjectId
    dataVisita: Date
  }[]
  dataRegistro: Date
}

const VisitanteEventoSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
    cpf: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    visitasLojas: [
      {
        lojaId: { type: mongoose.Schema.Types.ObjectId, ref: "Loja" },
        dataVisita: { type: Date, default: Date.now },
      },
    ],
    dataRegistro: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

const VisitanteEventoModel =
  mongoose.models.VisitanteEvento || mongoose.model<IVisitanteEvento>("VisitanteEvento", VisitanteEventoSchema)
export default VisitanteEventoModel

