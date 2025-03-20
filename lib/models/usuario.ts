import mongoose, { Schema, type Document } from "mongoose"

export interface IUsuario extends Document {
  nome: string
  email: string
  senha: string
  role: "user" | "admin"
  plano: mongoose.Types.ObjectId
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

const UsuarioSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plano: { type: Schema.Types.ObjectId, ref: "Plano" },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Usuario = mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", UsuarioSchema)

