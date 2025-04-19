import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

// Update the Session user interface to include lojaId
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      nome?: string
      emailVerificado?: boolean
      plano?: string
      twoFactorEnabled?: boolean
      twoFactorMethod?: "app" | "email"
      permissoes?: string[]
      lojaId?: string
    }
  }
}

// Also update the JWT interface to include lojaId
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    lojaId?: string
    nome?: string
    emailVerificado?: boolean
    plano?: string
    permissoes?: string[]
  }
}

const MONGODB_URI = process.env.MONGODB_URI || ""

// Connect to MongoDB with proper connection pooling
let clientPromise: Promise<MongoClient> | null = null

async function getMongoClient() {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(MONGODB_URI)
  }
  return clientPromise
}

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await getMongoClient()
    const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "prod-db"
    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

// Add the missing functions
/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Validate password strength
 * @param password The password to validate
 * @returns An object with validation result and message
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter pelo menos 8 caracteres" }
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula" }
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula" }
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número" }
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um caractere especial" }
  }

  return { valid: true, message: "Senha válida" }
}

// Get cookie domain from environment or derive it from NEXTAUTH_URL
function getCookieDomain() {
  // First check for explicit COOKIE_DOMAIN env var
  if (process.env.COOKIE_DOMAIN) {
    return process.env.COOKIE_DOMAIN
  }

  // Otherwise try to derive from NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
    try {
      const url = new URL(process.env.NEXTAUTH_URL)
      return url.hostname
    } catch (e) {
      console.warn("Failed to parse NEXTAUTH_URL for cookie domain:", e)
    }
  }

  // Return undefined for localhost/development
  return undefined
}

// Simple OTP verification function to replace speakeasy
function verifyOTP(token: string, secret: string): boolean {
  // This is a simplified placeholder - in production you should use a proper OTP library
  // or implement a secure algorithm
  console.log("OTP verification bypassed - implement proper verification")
  return token === secret.substring(0, 6) // Very basic check - NOT for production
}

export const authOptions: NextAuthOptions = {
  providers: [
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
          console.log("Email não fornecido")
          return null
        }

        try {
          const { db } = await connectToDatabase()

          // Normalize email for case-insensitive comparison
          const normalizedEmail = credentials.email.toLowerCase()

          // Find user by email
          const user = await db.collection("usuarios").findOne({
            email: { $regex: new RegExp(`^${normalizedEmail}`, "i") },
          })

          if (!user) {
            console.log(`Usuário não encontrado: ${normalizedEmail}`)
            return null
          }

          // If emailVerified flag is set, skip password check (coming from email verification flow)
          if (credentials.emailVerified === "true") {
            // Update last login
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

          // Regular login flow - check password
          if (!credentials.password) {
            console.log("Senha não fornecida")
            return null
          }

          // Check which password field to use
          const passwordField = user.senha || user.password
          if (!passwordField) {
            console.log("Usuário não possui senha cadastrada")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, passwordField)

          if (!isPasswordValid) {
            console.log("Senha inválida")
            return null
          }

          // Check if email verification is required
          const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"

          if (requireEmailVerification && !user.emailVerificado) {
            throw new Error("EMAIL_VERIFICATION_REQUIRED")
          }

          // Check if 2FA is enabled - simplified version without speakeasy
          if (user.twoFactorEnabled) {
            // If no token provided, require 2FA
            if (!credentials.twoFactorToken) {
              throw new Error("2FA_REQUIRED")
            }

            // Check which 2FA method is being used
            if (user.twoFactorMethod === "app" && user.twoFactorSecret) {
              // Simple verification - replace with proper implementation
              const verified = verifyOTP(credentials.twoFactorToken, user.twoFactorSecret)

              if (!verified) {
                throw new Error("2FA_INVALID")
              }
            } else if (user.twoFactorMethod === "email") {
              // Verify the token from email
              const emailVerification = await db.collection("emailVerifications").findOne({
                email: user.email,
                otp: credentials.twoFactorToken,
                purpose: "2fa",
                expiresAt: { $gt: new Date() },
              })

              if (!emailVerification) {
                throw new Error("2FA_INVALID")
              }

              // Delete the used OTP
              await db.collection("emailVerifications").deleteOne({ _id: emailVerification._id })
            }
          }

          // Update last login
          await db.collection("usuarios").updateOne({ _id: user._id }, { $set: { ultimoLogin: new Date() } })

          console.log(`Login bem-sucedido para: ${user.email}`)

          return {
            id: user._id.toString(),
            name: user.nome || user.name,
            email: user.email,
            role: user.role || "user",
            image: user.image || null,
            lojaId: user.lojaId || null,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          throw error
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const { db } = await connectToDatabase()

          // Check if user already exists
          const existingUser = await db.collection("usuarios").findOne({ email: user.email })

          if (existingUser) {
            // Update user with Google info
            await db.collection("usuarios").updateOne(
              { email: user.email },
              {
                $set: {
                  googleId: user.id,
                  image: user.image || existingUser.image,
                  ultimoLogin: new Date(),
                },
              },
            )
            console.log(`Usuário Google atualizado: ${user.email}`)
          } else {
            // Create new user
            const newUser = {
              nome: user.name,
              email: user.email,
              googleId: user.id,
              image: user.image,
              role: "user",
              emailVerificado: true,
              plano: "gratuito",
              dataCriacao: new Date(),
              ultimoLogin: new Date(),
            }

            await db.collection("usuarios").insertOne(newUser)
            console.log(`Novo usuário Google criado: ${user.email}`)
          }
        } catch (error) {
          console.error("Erro ao processar login do Google:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // When user signs in initially
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        if ("lojaId" in user) token.lojaId = user.lojaId
      }

      // Update token when session is updated
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      // Fetch fresh user data on each token refresh
      if (token.id) {
        try {
          const { db } = await connectToDatabase()

          const userData = await db.collection("usuarios").findOne({
            _id: new ObjectId(token.id),
          })

          if (userData) {
            token.role = userData.role || "user"
            token.nome = userData.nome || userData.name || ""
            token.emailVerificado = userData.emailVerificado || false
            token.plano = userData.plano || "gratuito"
            token.lojaId = userData.lojaId || null
            token.permissoes = userData.permissoes || []
          }
        } catch (error) {
          console.error("Erro ao atualizar dados do token:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.nome = token.nome
        session.user.emailVerificado = token.emailVerificado
        session.user.plano = token.plano
        session.user.lojaId = token.lojaId
        session.user.permissoes = token.permissoes
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
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(),
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(),
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(),
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Para compatibilidade com código existente
export const nextAuthConfig = authOptions

// Exportar handlers para uso no App Router
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
