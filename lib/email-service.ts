import nodemailer from "nodemailer"

// Configuração do serviço de email
// Atualizar a configuração do transporter para garantir compatibilidade com MailerSend
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailersend.net",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Adicionar configurações específicas para o MailerSend
  tls: {
    rejectUnauthorized: false, // Ajuda a evitar problemas de certificado em alguns ambientes
    ciphers: "SSLv3",
  },
})

export async function sendOtpEmail(to: string, otpCode: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@fletoads.com",
      to,
      subject: "Código de Verificação - FletoAds",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
          <p style="color: #555; font-size: 16px;">Você solicitou a recuperação de senha da sua conta FletoAds.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Seu código de verificação é:</p>
            <h1 style="margin: 10px 0; color: #0066cc; letter-spacing: 5px; font-size: 32px;">${otpCode}</h1>
            <p style="margin: 0; font-size: 14px;">Este código é válido por 15 minutos.</p>
          </div>
          <p style="color: #555; font-size: 14px;">Se você não solicitou esta recuperação de senha, ignore este email.</p>
          <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">© ${new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email enviado:", info.messageId)
    return true
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return false
  }
}
