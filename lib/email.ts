// @ts-ignore
import nodemailer from "nodemailer"

// Configurar o transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Função para enviar email de verificação
export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  const mailOptions = {
    from: `"FletoAds" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Verifique seu email - FletoAds",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4f46e5; text-align: center;">Verifique seu email</h2>
        <p>Olá ${name},</p>
        <p>Obrigado por se cadastrar no FletoAds. Para completar seu cadastro, por favor verifique seu email clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar Email</a>
        </div>
        <p>Ou copie e cole o link abaixo no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não solicitou este email, por favor ignore-o.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Função para enviar email de redefinição de senha
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const mailOptions = {
    from: `"FletoAds" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Redefinição de Senha - FletoAds",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4f46e5; text-align: center;">Redefinição de Senha</h2>
        <p>Olá ${name},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
        </div>
        <p>Ou copie e cole o link abaixo no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta redefinição de senha, por favor ignore este email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Função para enviar código de autenticação de dois fatores
export async function sendTwoFactorCode(to: string, name: string, code: string) {
  const mailOptions = {
    from: `"FletoAds" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Código de Verificação - FletoAds",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4f46e5; text-align: center;">Código de Verificação</h2>
        <p>Olá ${name},</p>
        <p>Seu código de verificação para login é:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${code}</div>
        </div>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não tentou fazer login, por favor, altere sua senha imediatamente.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

