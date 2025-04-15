"use server"

import { MongoClient } from "mongodb"
import nodemailer from "nodemailer"

const MONGODB_URI = process.env.MONGODB_URI || ""
const EMAIL_HOST = process.env.EMAIL_HOST || ""
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587")
const EMAIL_USER = process.env.EMAIL_USER || ""
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ""
const EMAIL_FROM = process.env.EMAIL_FROM || ""

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI)
    const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "prod-db"
    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
async function sendOTPEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: "Recuperação de senha - FletoAds",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para continuar o processo:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe FletoAds</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Request password reset
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, message: "Email é obrigatório" }
  }

  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Check if user exists
    const user = await db.collection("usuarios").findOne({ email })

    if (!user) {
      return { success: false, message: "Email não encontrado" }
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // OTP expires in 15 minutes

    // Save OTP to database
    await db.collection("passwordResets").updateOne(
      { email },
      {
        $set: {
          otp,
          expiresAt,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    // Send OTP via email
    await sendOTPEmail(email, otp)

    return { success: true, message: "Código enviado para seu email" }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { success: false, message: "Erro ao processar solicitação" }
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Verify OTP
export async function verifyOTP(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string

  if (!email || !otp) {
    return { success: false, message: "Email e código são obrigatórios" }
  }

  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Find the password reset record
    const resetRecord = await db.collection("passwordResets").findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return { success: false, message: "Código inválido ou expirado" }
    }

    return { success: true, message: "Código verificado com sucesso" }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return { success: false, message: "Erro ao verificar código" }
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Reset password
export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !otp || !password || !confirmPassword) {
    return { success: false, message: "Todos os campos são obrigatórios" }
  }

  if (password !== confirmPassword) {
    return { success: false, message: "As senhas não coincidem" }
  }

  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Verify OTP again
    const resetRecord = await db.collection("passwordResets").findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return { success: false, message: "Código inválido ou expirado" }
    }

    // Hash the new password
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password
    await db.collection("usuarios").updateOne(
      { email },
      {
        $set: {
          senha: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    // Delete the used OTP
    await db.collection("passwordResets").deleteOne({ email, otp })

    return { success: true, message: "Senha atualizada com sucesso" }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, message: "Erro ao redefinir senha" }
  } finally {
    if (client) {
      await client.close()
    }
  }
}
