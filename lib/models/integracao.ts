import mongoose, { Schema, type Document } from "mongoose"

export interface IIntegracao extends Document {
  nome: string
  tipo: string
  descricao: string
  icone: string
  status: "ativo" | "inativo" | "pendente"
  configuracao: Record<string, any>
  credenciais: Record<string, any>
  lojaId: mongoose.Types.ObjectId
  dataCriacao: Date
  dataAtualizacao: Date
  ultimaSincronizacao?: Date
}

const IntegracaoSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    descricao: { type: String, required: true },
    icone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ativo", "inativo", "pendente"],
      default: "pendente",
    },
    configuracao: { type: Object, default: {} },
    credenciais: {
      type: Object,
      default: {},
      // Criptografar credenciais sensíveis
      set: (credenciais: Record<string, any>) => {
        // Em produção, implementar criptografia aqui
        return credenciais
      },
    },
    lojaId: { type: Schema.Types.ObjectId, ref: "Loja", required: true },
    ultimaSincronizacao: { type: Date },
  },
  {
    timestamps: {
      createdAt: "dataCriacao",
      updatedAt: "dataAtualizacao",
    },
  },
)

export default mongoose.models.Integracao || mongoose.model<IIntegracao>("Integracao", IntegracaoSchema)

