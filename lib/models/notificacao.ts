import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface INotificacao extends Document {
  usuario: Types.ObjectId
  titulo: string
  mensagem: string
  tipo: "info" | "success" | "warning" | "error"
  lida: boolean
  link?: string
  dataCriacao: Date
}

const NotificacaoSchema: Schema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
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
    lida: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "dataCriacao",
      updatedAt: false,
    },
  },
)

export default mongoose.models.Notificacao || mongoose.model<INotificacao>("Notificacao", NotificacaoSchema)

