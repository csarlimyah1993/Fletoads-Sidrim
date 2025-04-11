import mongoose, { Schema, type Document, type Model } from "mongoose"
import { connectMongoose } from "@/lib/mongodb"

// Garantir que o Mongoose esteja conectado
connectMongoose().catch((err) => console.error("Erro ao conectar Mongoose:", err))

// Interface para recursos do plano
interface IRecursos {
  panfletos: number
  produtos: number
  integracoes: number
  campanhas?: number
  armazenamento?: number
  suporte?: string
  customizacao?: boolean
  analisesAvancadas?: boolean
  [key: string]: any // Para recursos adicionais
}

// Interface para o documento Plano
export interface IPlano extends Document {
  nome: string
  descricao?: string
  preco: number
  recursos: IRecursos
  ativo: boolean
  ordem?: number
  createdAt: Date
  updatedAt: Date
}

// Esquema para recursos
const RecursosSchema = new Schema<IRecursos>(
  {
    panfletos: { type: Number, required: true },
    produtos: { type: Number, required: true },
    integracoes: { type: Number, required: true },
    campanhas: { type: Number },
    armazenamento: { type: Number },
    suporte: { type: String },
    customizacao: { type: Boolean },
    analisesAvancadas: { type: Boolean },
  },
  { _id: false, strict: false }, // Permitir campos adicionais
)

// Esquema para o plano
const PlanoSchema = new Schema<IPlano>(
  {
    nome: { type: String, required: true, unique: true },
    descricao: { type: String },
    preco: { type: Number, required: true },
    recursos: { type: RecursosSchema, required: true },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number },
  },
  { timestamps: true },
)

// Verificar se o modelo já foi compilado para evitar erros de overwrite
let PlanoModel: Model<IPlano>

try {
  // Tenta obter o modelo existente
  PlanoModel = mongoose.model<IPlano>("Plano")
} catch (error) {
  // Se o modelo não existir, cria um novo
  PlanoModel = mongoose.model<IPlano>("Plano", PlanoSchema, "planos")
}

export default PlanoModel
