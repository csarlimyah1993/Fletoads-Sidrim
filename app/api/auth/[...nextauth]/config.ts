// lib/auth-config.ts
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import * as speakeasy from "speakeasy"

// Função para obter dados atualizados do usuário
const getUserData = async (userId: string) => {
  try {
    const { db } = await connectToDatabase()
    // Converter string para ObjectId
    const objectId = new ObjectId(userId)
    const user = await db.collection("usuarios").findOne({ _id: objectId })
    if (!user) return null

    return {
      id: user._id.toString(),
      name: user.nome || "",
      email: user.email,
      role: user.role || "user",
      nome: user.nome || "",
      permissoes: user.permissoes || [],
      plano: user.plano || "gratuito",
      lojaId: user.lojaId,
      emailVerificado: user.emailVerificado,
      twoFactorEnabled: user.twoFactorEnabled || false,
      twoFactorMethod: user.twoFactorMethod || "app",
    }
  } catch (error) {
    console.error("Erro ao buscar dados atualizados do usuário:", error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        twoFactorToken: { label: "Código de verificação", type: "text" },
        emailVerified: { label: "Email verificado", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          console.log("Credenciais incompletas: email ausente")
          return null
        }

        try {
          const { db } = await connectToDatabase()
          console.log("Conectado ao MongoDB com sucesso")

          // Normalizar o email para comparação case-insensitive
          const normalizedEmail = credentials.email.toLowerCase()
          console.log("Buscando usuário com email:", normalizedEmail)

          // Buscar o usuário na coleção "usuarios"
          const user = await db.collection("usuarios").findOne({
            email: { $regex: new RegExp(`^${normalizedEmail}`, "i") },
          })

          if (!user) {
            console.log(`Usuário não encontrado: ${normalizedEmail}`)
            return null
          }

          console.log(`Usuário encontrado: ${user.email}`)

          // Se emailVerified flag estiver definido, pular verificação de senha (vindo do fluxo de verificação de email)
          if (credentials.emailVerified === "true") {
            // Atualizar último login
            await db.collection("usuarios").updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

            return {
              id: user._id.toString(),
              name: user.nome || user.name,
              email: user.email,
              role: user.role || "user",
              image: user.image || null,
              lojaId: user.lojaId || null,
            }
          }

          // Fluxo de login regular - verificar senha
          if (!credentials.password) {
            console.log("Credenciais incompletas: senha ausente")
            return null
          }

          // Verificar qual campo de senha usar
          const senhaField = user.senha || user.password
          if (!senhaField) {
            console.log("Usuário não possui campo de senha")
            return null
          }

          // Verificar senha com bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, senhaField)

          if (!isValidPassword) {
            console.log("Senha inválida para usuário:", credentials.email)
            return null
          }

          // Verificar se a verificação de email é necessária
          const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"

          if (requireEmailVerification && !user.emailVerificado) {
            throw new Error("EMAIL_VERIFICATION_REQUIRED")
          }

          // Verificar se 2FA está habilitado
          if (user.twoFactorEnabled) {
            // Se nenhum token for fornecido, exigir 2FA
            if (!credentials.twoFactorToken) {
              throw new Error("2FA_REQUIRED")
            }

            // Verificar qual método 2FA está sendo usado
            if (user.twoFactorMethod === "app" && user.twoFactorSecret) {
              // Verificar o token com o app autenticador
              const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token: credentials.twoFactorToken,
                window: 1, // Permitir 1 passo antes/depois para desvio de tempo
              })

              if (!verified) {
                throw new Error("2FA_INVALID")
              }
            } else if (user.twoFactorMethod === "email") {
              // Verificar o token do email
              const emailVerification = await db.collection("emailVerifications").findOne({
                email: user.email,
                otp: credentials.twoFactorToken,
                purpose: "2fa",
                expiresAt: { $gt: new Date() },
              })

              if (!emailVerification) {
                throw new Error("2FA_INVALID")
              }

              // Excluir o OTP usado
              await db.collection("emailVerifications").deleteOne({ _id: emailVerification._id })
            }
          }

          console.log("Autenticação bem-sucedida para:", user.email)

          // Atualizar último login
          await db.collection("usuarios").updateOne({ _id: user._id }, { $set: { ultimoLogin: new Date() } })

          // Retornar os dados do usuário para a sessão
          return {
            id: user._id.toString(),
            name: user.nome || "",
            email: user.email,
            role: user.role || "user",
            nome: user.nome || "",
            image: user.image || null,
            lojaId: user.lojaId || null,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {

      console.log("[NextAuth] signIn callback - user:", user)
      console.log("[NextAuth] signIn callback - account:", account)
      console.log("[NextAuth] signIn callback - profile:", profile)


      if (account?.provider === "google") {
        try {
          const { db } = await connectToDatabase()

          // Verificar se o usuário já existe
          const existingUser = await db.collection("usuarios").findOne({ email: user.email })

          if (!existingUser) {
            // Criar novo usuário com login do Google
            const newUser = {
              email: user.email,
              nome: user.name,
              role: "user",
              permissoes: [],
              googleId: user.id,
              dataCriacao: new Date(),
              ultimoLogin: new Date(),
              imagemPerfil: user.image,
              emailVerificado: true,
              plano: "gratuito"
            }

            await db.collection("usuarios").insertOne(newUser)
            console.log("Novo usuário criado via Google:", user.email)
          } else {
            // Atualizar informações do usuário existente
            await db.collection("usuarios").updateOne(
              { email: user.email },
              {
                $set: {
                  ultimoLogin: new Date(),
                  googleId: user.id,
                  imagemPerfil: user.image || existingUser.imagemPerfil,
                },
              },
            )
            console.log("Usuário existente atualizado via Google:", user.email)
          }
        } catch (error) {
          console.error("Erro ao processar login do Google:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // Quando o usuário faz login inicialmente
      if (user) {
        token.id = user.id || ""
        token.role = user.role || "user"
        token.nome = user.nome || user.name || ""
        token.permissoes = user.permissoes || []
        token.plano = user.plano || "gratuito"
        token.lojaId = user.lojaId
        token.emailVerificado = user.emailVerificado
      }

      // Atualizar token quando a sessão for atualizada
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      // Atualizar dados do usuário a cada solicitação de token
      if (token.id) {
        const updatedUser = await getUserData(token.id as string)
        if (updatedUser) {
          token.role = updatedUser.role
          token.nome = updatedUser.nome
          token.permissoes = updatedUser.permissoes
          token.plano = updatedUser.plano
          token.lojaId = updatedUser.lojaId
          token.emailVerificado = updatedUser.emailVerificado
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Use type assertion to bypass TypeScript's type checking
        const user = session.user as any

        user.id = token.id || ""
        user.role = token.role || "user"
        user.nome = token.nome || ""
        user.permissoes = token.permissoes || []
        user.plano = token.plano || "gratuito"
        user.lojaId = token.lojaId
        user.emailVerificado = token.emailVerificado
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  // Configuração de cookies para garantir que funcionem em produção
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Para compatibilidade com código existente
export const nextAuthConfig = authOptions