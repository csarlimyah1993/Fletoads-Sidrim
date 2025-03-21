import mongoose from "mongoose"

const vendaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  data: {
    type: Date,
    required: true,
    default: Date.now,
  },
  valor: {
    type: Number,
    required: true,
  },
  cliente: {
    type: String,
    required: false,
  },
  produtos: [
    {
      produtoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto",
      },
      quantidade: {
        type: Number,
        required: true,
        default: 1,
      },
      precoUnitario: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pendente", "pago", "cancelado"],
    default: "pendente",
  },
  metodoPagamento: {
    type: String,
    enum: ["dinheiro", "cartao", "pix", "outro"],
    default: "dinheiro",
  },
  observacoes: {
    type: String,
  },
})

// Verificar se o modelo já existe para evitar redefinição
export const Venda = mongoose.models.Venda || mongoose.model("Venda", vendaSchema)

