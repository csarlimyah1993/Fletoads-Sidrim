import mongoose from "mongoose"

// Define the schema for the Venda model
const vendaSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    codigo: {
      type: String,
      required: true,
    },
    data: {
      type: Date,
      default: Date.now,
    },
    dataVenda: {
      type: Date,
      default: Date.now,
    },
    valorTotal: {
      type: Number,
    },
    valor: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
    cliente: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    produtos: [
      {
        produtoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produto",
        },
        nome: String,
        quantidade: Number,
        precoUnitario: Number,
        subtotal: Number,
      },
    ],
    metodoPagamento: {
      type: String,
      enum: ["cartao_credito", "cartao_debito", "dinheiro", "pix", "transferencia", "boleto"],
      default: "dinheiro",
    },
    observacoes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
)

// Check if the model already exists to prevent recompilation errors
const VendaModel = mongoose.models.Venda || mongoose.model("Venda", vendaSchema)

// Export as default
export default VendaModel
