// auth.ts
import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"
import * as speakeasy from "speakeasy"

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
  }
}

const MONGODB_URI = process.env.MONGODB_URI || ""

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
          return null
        }

        let client
        try {
          const { client: mongoClient, db } = await connectToDatabase()
          client = mongoClient

          // Find user by email
          const user = await db.collection("usuarios").findOne({ email: credentials.email })

          if (!user) {
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
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.senha)

          if (!isPasswordValid) {
            return null
          }

          // Check if email verification is required
          const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"

          if (requireEmailVerification && !user.emailVerificado) {
            throw new Error("EMAIL_VERIFICATION_REQUIRED")
          }

          // Check if 2FA is enabled
          if (user.twoFactorEnabled) {
            // If no token provided, require 2FA
            if (!credentials.twoFactorToken) {
              throw new Error("2FA_REQUIRED")
            }

            // Check which 2FA method is being used
            if (user.twoFactorMethod === "app" && user.twoFactorSecret) {
              // Verify the token with authenticator app
              const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token: credentials.twoFactorToken,
                window: 1, // Allow 1 step before/after for time drift
              })

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

          // Update last login teste
          await db.collection("usuarios").updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

          return {
            id: user._id.toString(),
            name: user.nome || user.name,
            email: user.email,
            role: user.role || "user",
            image: user.image || null,
            lojaId: user.lojaId || null,
          }
        } catch (error) {
          console.error("Error in authorize:", error)
          throw error
        } finally {
          if (client) {
            await client.close()
          }
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
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // If it's a Google sign in
        if (account.provider === "google") {
          let client
          try {
            const { client: mongoClient, db } = await connectToDatabase()
            client = mongoClient

            // Check if user already exists
            const existingUser = await db.collection("usuarios").findOne({ email: user.email })

            if (existingUser) {
              // Update user with Google info if needed
              await db.collection("usuarios").updateOne(
                { email: user.email },
                {
                  $set: {
                    googleId: user.id,
                    image: user.image || existingUser.image,
                    updatedAt: new Date(),
                  },
                },
              )

              token.id = existingUser._id.toString()
              token.role = existingUser.role || "user"
              token.lojaId = existingUser.lojaId || null
            } else {
              // Create new user
              const newUser = {
                nome: user.name,
                email: user.email,
                googleId: user.id,
                image: user.image,
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
              }

              const result = await db.collection("usuarios").insertOne(newUser)
              token.id = result.insertedId.toString()
              token.role = "user"
            }
          } catch (error) {
            console.error("Error handling Google sign in:", error)
          } finally {
            if (client) {
              await client.close()
            }
          }
        } else {
          // Credentials login
          token.id = user.id
          token.role = user.role || "user"
          if ("lojaId" in user) token.lojaId = user.lojaId
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        if (token.lojaId) session.user.lojaId = token.lojaId

        // Buscar informações adicionais do usuário
        let client
        try {
          const { client: mongoClient, db } = await connectToDatabase()
          client = mongoClient

          const user = await db.collection("usuarios").findOne({
            _id: new ObjectId(token.id),
          })

          if (user) {
            // Garantir que a role do banco de dados seja usada
            session.user.role = user.role || "user"

            // Adicionar outros campos do usuário à sessão
            session.user.nome = user.nome || user.name || ""
            session.user.emailVerificado = user.emailVerificado || false
            session.user.plano = user.plano || "gratuito"
            session.user.twoFactorEnabled = user.twoFactorEnabled || false
            session.user.twoFactorMethod = user.twoFactorMethod || "app"
            session.user.lojaId = user.lojaId || null

            if (user.permissoes) {
              session.user.permissoes = user.permissoes
            } else {
              session.user.permissoes = []
            }
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error)
        } finally {
          if (client) {
            await client.close()
          }
        }
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
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL?.replace('https://', '') : undefined
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.callback-url" 
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL?.replace('https://', '') : undefined
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.csrf-token" 
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL?.replace('https://', '') : undefined
      },
    },
  },
  // Importante: não usar debug em produção
  debug: process.env.NODE_ENV === "development",
  // O Vercel define automaticamente o NEXTAUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,
}

// Para compatibilidade com código existente
export const nextAuthConfig = authOptions

// Exportar handlers para uso no App Router
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
