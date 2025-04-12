import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

// Funções de utilidade para senhas
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter pelo menos 8 caracteres" }
  }

  // Verificar se tem pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula" }
  }

  // Verificar se tem pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula" }
  }

  // Verificar se tem pelo menos um número
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número" }
  }

  return { valid: true }
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

// Definindo tipos para o usuário
interface UserData {
  id: string
  name: string
  email: string
  role: string
  nome: string
  cargo: string
  permissoes: string[]
  plano: string
  emailVerificado?: boolean
  lojaId?: string
}

// Interface para usuário customizado
interface CustomUser {
  _id: string | ObjectId
  email: string
  nome: string
  senha: string
  role: string
  plano: string
  ultimoLogin: Date
  permissoes?: string[]
  emailVerificado?: boolean
  lojaId?: string
  save: () => Promise<any>
  compararSenha: (senha: string) => Promise<boolean>
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Credenciais incompletas")
            return null
          }

          const { db } = await connectToDatabase()

          // Buscar o usuário pelo email em múltiplas coleções
          let user: any = await UsuarioModel.findOne({ email: credentials.email })

          // Se não encontrar na coleção "usuarios", tenta na coleção "users"
          if (!user) {
            console.log("Usuário não encontrado em 'usuarios', tentando em 'users'...")
            const usersCollection = db.collection("users")
            const userFromUsers = await usersCollection.findOne({ email: credentials.email })

            if (userFromUsers) {
              console.log("Usuário encontrado na coleção 'users'")
              // Converter para o formato esperado
              user = {
                _id: userFromUsers._id.toString(),
                email: userFromUsers.email,
                nome: userFromUsers.nome || userFromUsers.name || "",
                senha: userFromUsers.senha || userFromUsers.password || "",
                role: userFromUsers.role || userFromUsers.cargo || "user",
                plano: userFromUsers.plano || "gratuito",
                ultimoLogin: new Date(),
                permissoes: userFromUsers.permissoes || [],
                emailVerificado: userFromUsers.emailVerificado || false,
                lojaId: userFromUsers.lojaId || undefined,
                // Implementação de save() para usuários da coleção "users"
                save: async function () {
                  try {
                    await usersCollection.updateOne(
                      { _id: new ObjectId(this._id.toString()) },
                      { $set: { ultimoLogin: this.ultimoLogin } },
                    )
                    return this
                  } catch (error) {
                    console.error("Erro ao salvar usuário:", error)
                    return this
                  }
                },
                compararSenha: async function (senhaFornecida: string) {
                  // Implementação simplificada para usuários da coleção "users"
                  if (this.senha.startsWith("$2a$") || this.senha.startsWith("$2b$")) {
                    return await bcrypt.compare(senhaFornecida, this.senha)
                  } else {
                    return senhaFornecida === this.senha
                  }
                },
              }
            }
          }

          if (!user) {
            console.log("Usuário não encontrado em nenhuma coleção:", credentials.email)
            return null
          }

          console.log("Tentando autenticar usuário:", credentials.email)
          console.log("Cargo do usuário:", user.role || "não definido")
          console.log("ID do usuário:", user._id)
          console.log("LojaId do usuário:", user.lojaId || "não definido")

          // Caso especial para sidrimthiago@gmail.com
          if (
            credentials.email === "sidrimthiago@gmail.com" &&
            (credentials.password === "sidrinho123" || credentials.password === user.senha)
          ) {
            console.log("Login especial bem-sucedido para:", user.email)

            // Atualizar último login
            user.ultimoLogin = new Date()
            await user.save()

            const userData = {
              id: typeof user._id === "object" ? user._id.toString() : user._id,
              name: user.nome || "",
              email: user.email,
              role: user.role || "user",
              nome: user.nome || "",
              cargo: user.role || "user",
              permissoes: user.permissoes || [],
              plano: user.plano || "gratuito",
              emailVerificado: user.emailVerificado || false,
              lojaId: user.lojaId,
            } as UserData

            console.log("Returning user data:", userData)
            return userData
          }

          // Verificação especial para o admin
          if (credentials.email === "admin@fletoads.com" && credentials.password === "admin123") {
            console.log("Login de admin com senha padrão bem-sucedido")

            // Atualizar último login
            user.ultimoLogin = new Date()
            await user.save()

            const userData = {
              id: typeof user._id === "object" ? user._id.toString() : user._id,
              name: user.nome || "",
              email: user.email,
              role: "admin",
              nome: user.nome || "",
              cargo: "admin",
              permissoes: user.permissoes || [],
              plano: user.plano || "admin",
              emailVerificado: user.emailVerificado || false,
              lojaId: user.lojaId,
            } as UserData

            console.log("Returning admin user data:", userData)
            return userData
          }

          // Verificação normal para outros usuários
          let isPasswordValid = false

          // Verificar se a senha armazenada é um hash bcrypt
          if (typeof user.compararSenha === "function") {
            isPasswordValid = await user.compararSenha(credentials.password)
          } else if (user.senha.startsWith("$2a$") || user.senha.startsWith("$2b$")) {
            isPasswordValid = await bcrypt.compare(credentials.password, user.senha)
          } else {
            // Comparação direta se não for hash
            isPasswordValid = credentials.password === user.senha
          }

          console.log("Resultado da comparação de senha:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("Senha inválida para usuário:", credentials.email)
            return null
          }

          console.log("Autenticação bem-sucedida para:", user.email)

          // Atualizar último login
          user.ultimoLogin = new Date()
          await user.save()

          // Retornar os dados do usuário para a sessão
          const userData = {
            id: typeof user._id === "object" ? user._id.toString() : user._id,
            name: user.nome || "",
            email: user.email,
            role: user.role === "admin" ? "admin" : "user",
            nome: user.nome || "",
            cargo: user.role || "user",
            permissoes: user.permissoes || [],
            plano: user.plano || "gratuito",
            emailVerificado: user.emailVerificado || false,
            lojaId: user.lojaId,
          } as UserData

          console.log("Returning regular user data:", userData)
          console.log("LojaId incluído na userData:", userData.lojaId)
          return userData
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        console.log("JWT callback - user data:", user)
        token.id = user.id || ""
        token.role = user.role || "user"
        token.nome = user.nome || ""
        token.cargo = user.cargo || "user"
        token.permissoes = user.permissoes || []
        token.plano = user.plano || "gratuito"
        token.emailVerificado = user.emailVerificado || false

        // Garantir que o lojaId seja incluído no token
        if (user.lojaId) {
          token.lojaId = user.lojaId
          console.log("LojaId adicionado ao token:", user.lojaId)
        } else {
          // Se não encontrar lojaId no user, tentar buscar no banco de dados
          try {
            const { db } = await connectToDatabase()
            const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(user.id) })
            if (usuario && usuario.lojaId) {
              token.lojaId = usuario.lojaId
              console.log("LojaId encontrado no banco e adicionado ao token:", usuario.lojaId)
            } else {
              // Tentar encontrar uma loja onde o usuário é proprietário
              const loja = await db.collection("lojas").findOne({ proprietarioId: user.id })
              if (loja) {
                token.lojaId = loja._id.toString()
                console.log("LojaId encontrado pela proprietarioId e adicionado ao token:", loja._id.toString())

                // Atualizar o usuário com o lojaId encontrado
                await db
                  .collection("usuarios")
                  .updateOne({ _id: new ObjectId(user.id) }, { $set: { lojaId: loja._id.toString() } })
              }
            }
          } catch (error) {
            console.error("Erro ao buscar lojaId:", error)
          }
        }
      }
      console.log("JWT callback - token data:", token)
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        console.log("Session callback - token data:", token)
        session.user.id = token.id || ""
        session.user.role = token.role || "user"
        session.user.nome = token.nome || ""
        session.user.cargo = token.cargo || "user"
        session.user.permissoes = token.permissoes || []
        session.user.plano = token.plano || "gratuito"
        session.user.emailVerificado = token.emailVerificado || false

        // Garantir que o lojaId seja incluído na sessão
        if (token.lojaId) {
          session.user.lojaId = token.lojaId
          console.log("LojaId adicionado à sessão:", token.lojaId)
        }
      }
      console.log("Session callback - session data:", session)
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}
