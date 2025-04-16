import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"
import * as speakeasy from "speakeasy"
import * as qrcode from "qrcode"
import nodemailer from "nodemailer"

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || ""
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587")
const EMAIL_USER = process.env.EMAIL_USER || ""
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ""
const EMAIL_FROM = process.env.EMAIL_FROM || ""

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
async function sendOTPEmail(email: string, otp: string, purpose: string) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  })

  const subject = purpose === "2fa" ? "Código de Autenticação - FletoAds" : "Código de Verificação - FletoAds"

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject,
    html: `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
       <h2 style="color: #333; text-align: center;">Código de Verificação</h2>
       <p>Olá,</p>
       <p>Seu código de verificação para ${purpose === "2fa" ? "autenticação de dois fatores" : "verificação de email"} é:</p>
       <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
         ${otp}
       </div>
       <p>Este código expira em 15 minutos.</p>
       <p>Se você não solicitou este código, ignore este e-mail e verifique a segurança da sua conta.</p>
       <p>Atenciosamente,<br>Equipe FletoAds</p>
     </div>
   `,
  }

  await transporter.sendMail(mailOptions)
}

// GET handler for security settings and 2FA status
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    const { db } = await connectToDatabase()
    const user = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Return security settings including 2FA status
    return NextResponse.json({
      twoFactorEnabled: !!user.twoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod || "app",
      twoFactorSecret: user.twoFactorSecret ? true : false,
      lastUpdated: user.updatedAt || new Date(),
      lastLogin: user.lastLogin || null,
    })
  } catch (error) {
    console.error("Error fetching security settings:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações de segurança" }, { status: 500 })
  }
}

// POST handler for enabling/disabling 2FA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email
    const body = await request.json()
    const { action, token, method } = body

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("usuarios")

    // Handle different actions
    switch (action) {
      case "enable2FA": {
        // Generate new secret for app-based 2FA
        const secret = speakeasy.generateSecret({
          name: `FletoAds:${session.user.email}`,
        })

        // Store the secret temporarily (not enabled yet until verified)
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              twoFactorSecret: secret.base32,
              twoFactorMethod: "app",
              twoFactorEnabled: false,
              updatedAt: new Date(),
            },
          },
        )

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || "")

        return NextResponse.json({
          success: true,
          secret: secret.base32,
          qrCode: qrCodeUrl,
        })
      }

      case "enable2FAEmail": {
        if (!userEmail) {
          return NextResponse.json({ error: "Email do usuário não encontrado" }, { status: 400 })
        }

        // Generate OTP for email-based 2FA
        const otp = generateOTP()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15) // OTP expires in 15 minutes

        // Save OTP to database
        await db.collection("emailVerifications").updateOne(
          { email: userEmail },
          {
            $set: {
              otp,
              expiresAt,
              createdAt: new Date(),
              purpose: "2fa",
            },
          },
          { upsert: true },
        )

        // Store the 2FA method temporarily (not enabled yet until verified)
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              twoFactorMethod: "email",
              twoFactorEnabled: false,
              updatedAt: new Date(),
            },
            $unset: { twoFactorSecret: "" }, // Remove any existing app-based secret
          },
        )

        // Send OTP via email
        await sendOTPEmail(userEmail, otp, "2fa")

        return NextResponse.json({
          success: true,
          message: "Código de verificação enviado para seu email",
        })
      }

      case "resendEmailCode": {
        if (!userEmail) {
          return NextResponse.json({ error: "Email do usuário não encontrado" }, { status: 400 })
        }

        // Generate new OTP
        const otp = generateOTP()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15) // OTP expires in 15 minutes

        // Save OTP to database
        await db.collection("emailVerifications").updateOne(
          { email: userEmail },
          {
            $set: {
              otp,
              expiresAt,
              createdAt: new Date(),
              purpose: "2fa",
            },
          },
          { upsert: true },
        )

        // Send OTP via email
        await sendOTPEmail(userEmail, otp, "2fa")

        return NextResponse.json({
          success: true,
          message: "Código de verificação reenviado para seu email",
        })
      }

      case "verify2FA": {
        if (!token) {
          return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

        if (!user) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        let verified = false

        // Verify based on the method
        if (method === "app" && user.twoFactorSecret) {
          // Verify app-based token
          verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 1, // Allow 1 step before/after for time drift
          })
        } else if (method === "email" && userEmail) {
          // Verify email-based token
          const emailVerification = await db.collection("emailVerifications").findOne({
            email: userEmail,
            otp: token,
            purpose: "2fa",
            expiresAt: { $gt: new Date() },
          })

          verified = !!emailVerification

          // Delete the used OTP if verified
          if (verified && emailVerification) {
            await db.collection("emailVerifications").deleteOne({ _id: emailVerification._id })
          }
        }

        if (!verified) {
          return NextResponse.json({ error: "Código inválido" }, { status: 400 })
        }

        // Enable 2FA with the selected method
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              twoFactorEnabled: true,
              twoFactorMethod: method,
              updatedAt: new Date(),
            },
          },
        )

        return NextResponse.json({
          success: true,
          message: "Autenticação de dois fatores ativada com sucesso",
        })
      }

      case "disable2FA": {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

        if (!user) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        if (!user.twoFactorEnabled) {
          return NextResponse.json({ error: "Autenticação de dois fatores não está ativada" }, { status: 400 })
        }

        // Verify the token based on the current 2FA method
        let verified = false

        if (user.twoFactorMethod === "app" && user.twoFactorSecret) {
          // Verify app-based token
          verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 1,
          })
        } else if (user.twoFactorMethod === "email" && userEmail) {
          // Verify email-based token
          const emailVerification = await db.collection("emailVerifications").findOne({
            email: userEmail,
            otp: token,
            purpose: "2fa",
            expiresAt: { $gt: new Date() },
          })

          verified = !!emailVerification

          // Delete the used OTP if verified
          if (verified && emailVerification) {
            await db.collection("emailVerifications").deleteOne({ _id: emailVerification._id })
          }
        }

        if (!verified) {
          return NextResponse.json({ error: "Código inválido" }, { status: 400 })
        }

        // Disable 2FA
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              twoFactorEnabled: false,
              updatedAt: new Date(),
            },
            $unset: { twoFactorSecret: "" },
          },
        )

        return NextResponse.json({
          success: true,
          message: "Autenticação de dois fatores desativada com sucesso",
        })
      }

      default:
        return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating security settings:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações de segurança" }, { status: 500 })
  }
}

// DELETE handler for disabling 2FA (alternative to POST with disable2FA action)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ error: "Autenticação de dois fatores não está ativada" }, { status: 400 })
    }

    // Verify the token based on the current 2FA method
    let verified = false

    if (user.twoFactorMethod === "app" && user.twoFactorSecret) {
      // Verify app-based token
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 1,
      })
    } else if (user.twoFactorMethod === "email" && session.user.email) {
      // Verify email-based token
      const emailVerification = await db.collection("emailVerifications").findOne({
        email: session.user.email,
        otp: token,
        purpose: "2fa",
        expiresAt: { $gt: new Date() },
      })

      verified = !!emailVerification

      // Delete the used OTP if verified
      if (verified && emailVerification) {
        await db.collection("emailVerifications").deleteOne({ _id: emailVerification._id })
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Disable 2FA
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: false,
          updatedAt: new Date(),
        },
        $unset: { twoFactorSecret: "" },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores desativada com sucesso",
    })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return NextResponse.json({ error: "Erro ao desativar autenticação de dois fatores" }, { status: 500 })
  }
}
