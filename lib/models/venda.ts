import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IVenda extends Document {
  codigo: string
  cliente: Types.ObjectId
  produtos: Array<{
    nome: string
    quantidade: number
    precoUnitario: number
    subtotal: number
  }>
  valorTotal: number
  status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado"
  metodoPagamento: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto" | "transferencia"
  dataVenda: Date
  dataAtualizacao: Date
  observacoes?: string
  vendedorId: Types.ObjectId
  lojaId: Types.ObjectId
}

const VendaSchema: Schema = new Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    produtos: [
      {
        nome: { type: String, required: true },
        quantidade: { type: Number, required: true, min: 1 },
        precoUnitario: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
    metodoPagamento: {
      type: String,
      enum: ["dinheiro", "cartao_credito", "cartao_debito", "pix", "boleto", "transferencia"],
      required: true,
    },
    dataVenda: {
      type: Date,
      default: Date.now,
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
    observacoes: {
      type: String,
    },
    vendedorId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    lojaId: {
      type: Schema.Types.ObjectId,
      ref: "Loja",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "dataVenda",
      updatedAt: "dataAtualizacao",
    },
  },
)

// Método para gerar código único para a venda
VendaSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Venda.countDocuments()
    this.codigo = `VND-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(4, "0")}`
  }
  next()
})

export default mongoose.models.Venda || mongoose.model<IVenda>("Venda", VendaSchema)

