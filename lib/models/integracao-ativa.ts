import mongoose, { Schema, type Document, type Model } from "mongoose"
import { connectMongoose } from "@/lib/mongodb"

// Garantir que o Mongoose esteja conectado
connectMongoose().catch((err) => console.error("Erro ao conectar Mongoose:", err))

export interface IIntegracaoAtiva extends Document {
  usuarioId: mongoose.Types.ObjectId
  integracaoId: string
  nome: string
  configuracao: Record<string, any>
  status: string
  ultimaSincronizacao?: Date
  criadoEm: Date
  atualizadoEm: Date
}

const IntegracaoAtivaSchema = new Schema<IIntegracaoAtiva>(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    integracaoId: { type: String, required: true },
    nome: { type: String, required: true },
    configuracao: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["ativa", "pendente", "erro"], default: "pendente" },
    ultimaSincronizacao: { type: Date },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
)

// Índice composto para garantir que um usuário não tenha a mesma integração ativa mais de uma vez
IntegracaoAtivaSchema.index({ usuarioId: 1, integracaoId: 1 }, { unique: true })

// Verificar se o modelo já foi compilado para evitar erros de overwrite
let IntegracaoAtivaModel: Model<IIntegracaoAtiva>

try {
  // Tenta obter o modelo existente
  IntegracaoAtivaModel = mongoose.model<IIntegracaoAtiva>("IntegracaoAtiva")
} catch (error) {
  // Se o modelo não existir, cria um novo
  IntegracaoAtivaModel = mongoose.model<IIntegracaoAtiva>(
    "IntegracaoAtiva",
    IntegracaoAtivaSchema,
    "integracoes_ativas",
  )
}

export default IntegracaoAtivaModel
