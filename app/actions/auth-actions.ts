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
    subject: "Código de verificação - FletoAds",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Verificação de Login</h2>
        <p>Olá,</p>
        <p>Para concluir seu login, use o código de verificação abaixo:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <p>Se você não tentou fazer login, ignore este e-mail e verifique a segurança da sua conta.</p>
        <p>Atenciosamente,<br>Equipe FletoAds</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Send email verification code
export async function sendEmailVerificationCode(email: string) {
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
    await db.collection("emailVerifications").updateOne(
      { email },
      {
        $set: {
          otp,
          expiresAt,
          createdAt: new Date(),
          purpose: "login",
        },
      },
      { upsert: true },
    )

    // Send OTP via email
    await sendOTPEmail(email, otp)

    return { success: true, message: "Código enviado para seu email" }
  } catch (error) {
    console.error("Error sending verification code:", error)
    return { success: false, message: "Erro ao enviar código de verificação" }
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Verify email OTP
export async function verifyEmailOTP(email: string, otp: string) {
  if (!email || !otp) {
    return { success: false, message: "Email e código são obrigatórios" }
  }

  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Find the verification record
    const verificationRecord = await db.collection("emailVerifications").findOne({
      email,
      otp,
      purpose: "login",
      expiresAt: { $gt: new Date() },
    })

    if (!verificationRecord) {
      return { success: false, message: "Código inválido ou expirado" }
    }

    // Delete the used OTP
    await db.collection("emailVerifications").deleteOne({ _id: verificationRecord._id })

    return { success: true, message: "Código verificado com sucesso" }
  } catch (error) {
    console.error("Error verifying email OTP:", error)
    return { success: false, message: "Erro ao verificar código" }
  } finally {
    if (client) {
      await client.close()
    }
  }
}
