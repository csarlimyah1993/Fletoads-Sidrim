import mongoose from "mongoose"

const promocaoSchema = new mongoose.Schema({
  lojaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loja",
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
  },
  imagem: {
    type: String,
  },
  dataInicio: {
    type: Date,
    required: true,
  },
  dataFim: {
    type: Date,
    required: true,
  },
  desconto: {
    type: Number,
    required: true,
  },
  tipoDesconto: {
    type: String,
    enum: ["percentual", "valor"],
    default: "percentual",
  },
  codigoPromocional: {
    type: String,
  },
  produtosAplicaveis: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
    },
  ],
  categoriasAplicaveis: [
    {
      type: String,
    },
  ],
  limitePorCliente: {
    type: Number,
  },
  quantidadeDisponivel: {
    type: Number,
  },
  quantidadeUtilizada: {
    type: Number,
    default: 0,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
  destaque: {
    type: Boolean,
    default: false,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
})

// Verificar se o modelo já existe para evitar sobrescrever
let Promocao: mongoose.Model<any>

try {
  Promocao = mongoose.model("Promocao")
} catch (e) {
  Promocao = mongoose.model("Promocao", promocaoSchema)
}

export default Promocao

