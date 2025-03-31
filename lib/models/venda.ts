import mongoose, { Schema, type Document } from "mongoose"

export interface IVenda extends Document {
  cliente: mongoose.Schema.Types.ObjectId
  produtos: {
    produto: mongoose.Schema.Types.ObjectId
    quantidade: number
    precoUnitario: number
    subtotal: number
  }[]
  valor: number
  status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado"
  formaPagamento: "cartao" | "boleto" | "pix" | "dinheiro" | "outro"
  dataVenda: Date
  dataAtualizacao: Date
  endereco?: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  codigoRastreio?: string
  observacoes?: string
  cupomDesconto?: string
  valorDesconto?: number
  vendedor?: mongoose.Schema.Types.ObjectId
  loja: mongoose.Schema.Types.ObjectId
}

const VendaSchema: Schema = new Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    produtos: [
      {
        produto: { type: mongoose.Schema.Types.ObjectId, ref: "Produto", required: true },
        quantidade: { type: Number, required: true, min: 1 },
        precoUnitario: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    valor: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
    formaPagamento: {
      type: String,
      enum: ["cartao", "boleto", "pix", "dinheiro", "outro"],
      required: true,
    },
    dataVenda: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
    endereco: {
      rua: { type: String },
      numero: { type: String },
      complemento: { type: String },
      bairro: { type: String },
      cidade: { type: String },
      estado: { type: String },
      cep: { type: String },
    },
    codigoRastreio: { type: String },
    observacoes: { type: String },
    cupomDesconto: { type: String },
    valorDesconto: { type: Number },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    loja: { type: mongoose.Schema.Types.ObjectId, ref: "Loja", required: true },
  },
  {
    timestamps: true,
  },
)

const VendaModel = mongoose.models.Venda || mongoose.model<IVenda>("Venda", VendaSchema)
export default VendaModel

