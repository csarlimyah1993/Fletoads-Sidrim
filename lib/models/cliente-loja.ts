import mongoose from "mongoose"

const clienteLojaSchema = new mongoose.Schema({
  lojaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loja",
    required: true,
  },
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  telefone: {
    type: String,
  },
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String,
  },
  dataNascimento: {
    type: Date,
  },
  observacoes: {
    type: String,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
  ultimaCompra: {
    type: Date,
  },
  totalCompras: {
    type: Number,
    default: 0,
  },
  valorTotalCompras: {
    type: Number,
    default: 0,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
})

// Verificar se o modelo já existe para evitar sobrescrever
let ClienteLoja: mongoose.Model<any>

try {
  ClienteLoja = mongoose.model("ClienteLoja")
} catch (e) {
  ClienteLoja = mongoose.model("ClienteLoja", clienteLojaSchema)
}

export default ClienteLoja

