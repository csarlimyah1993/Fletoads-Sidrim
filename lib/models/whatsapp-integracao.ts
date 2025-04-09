import mongoose from "mongoose"

const WhatsappIntegracaoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    lojaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loja",
    },
    nomeInstancia: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pendente", "conectado", "desconectado", "erro"],
      default: "pendente",
    },
    evolutionApiUrl: {
      type: String,
      default: "http://localhost:8080",
    },
    apiKey: {
      type: String,
      required: true,
    },
    telefone: {
      type: String,
    },
    ultimaConexao: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.WhatsappIntegracao || mongoose.model("WhatsappIntegracao", WhatsappIntegracaoSchema)

