import mongoose, { Schema, type Document } from "mongoose"

export interface IPagamento extends Document {
  usuario: mongoose.Types.ObjectId
  valor: number
  descricao: string
  status: "pendente" | "processando" | "concluido" | "falha" | "cancelado"
  metodo: "cartao" | "pix" | "boleto"
  paymentIntentId?: string
  metadata?: Record<string, any>
  dataCriacao: Date
  dataAtualizacao: Date
}

const PagamentoSchema = new Schema<IPagamento>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
    descricao: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "processando", "concluido", "falha", "cancelado"],
      default: "pendente",
    },
    metodo: {
      type: String,
      enum: ["cartao", "pix", "boleto"],
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "dataCriacao",
      updatedAt: "dataAtualizacao",
    },
  },
)

// Verificar se o modelo já existe para evitar redefinição
const Pagamento = mongoose.models.Pagamento || mongoose.model<IPagamento>("Pagamento", PagamentoSchema)

export default Pagamento

