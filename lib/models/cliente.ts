import mongoose, { Schema, type Document } from "mongoose"

export interface ICliente extends Document {
  nome: string
  email: string
  telefone: string
  empresa: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  dataCadastro: Date
  ultimoContato: Date
  status: "ativo" | "inativo" | "prospecto"
  observacoes: string
}

const ClienteSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
    empresa: { type: String },
    endereco: {
      rua: { type: String },
      numero: { type: String },
      complemento: { type: String },
      bairro: { type: String },
      cidade: { type: String },
      estado: { type: String },
      cep: { type: String },
    },
    dataCadastro: { type: Date, default: Date.now },
    ultimoContato: { type: Date },
    status: {
      type: String,
      enum: ["ativo", "inativo", "prospecto"],
      default: "prospecto",
    },
    observacoes: { type: String },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Cliente || mongoose.model<ICliente>("Cliente", ClienteSchema)

