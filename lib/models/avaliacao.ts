import mongoose from "mongoose"

const avaliacaoSchema = new mongoose.Schema({
  lojaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loja",
    required: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  usuarioNome: {
    type: String,
    required: true,
  },
  usuarioEmail: {
    type: String,
    required: true,
  },
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comentario: {
    type: String,
    required: true,
  },
  resposta: {
    type: String,
  },
  dataAvaliacao: {
    type: Date,
    default: Date.now,
  },
  dataResposta: {
    type: Date,
  },
})

// Verificar se o modelo já existe para evitar sobrescrever
let Avaliacao: mongoose.Model<any>

try {
  Avaliacao = mongoose.model("Avaliacao")
} catch (e) {
  Avaliacao = mongoose.model("Avaliacao", avaliacaoSchema)
}

export default Avaliacao

