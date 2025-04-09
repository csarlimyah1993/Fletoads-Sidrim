import mongoose from "mongoose"

const notificacaoAvancadaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  mensagem: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info",
  },
  link: {
    type: String,
  },
  icone: {
    type: String,
  },
  lida: {
    type: Boolean,
    default: false,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  dataExpiracao: {
    type: Date,
  },
  origem: {
    type: String,
    enum: ["sistema", "loja", "promocao", "pedido", "usuario"],
    default: "sistema",
  },
  referenciaId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  acoes: [
    {
      texto: String,
      link: String,
      tipo: {
        type: String,
        enum: ["primary", "secondary", "outline", "destructive"],
        default: "primary",
      },
    },
  ],
})

// Verificar se o modelo já existe para evitar sobrescrever
let NotificacaoAvancada: mongoose.Model<any>

try {
  NotificacaoAvancada = mongoose.model("NotificacaoAvancada")
} catch (e) {
  NotificacaoAvancada = mongoose.model("NotificacaoAvancada", notificacaoAvancadaSchema)
}

export default NotificacaoAvancada

