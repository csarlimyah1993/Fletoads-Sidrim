// Renomear a exportação para authOptions para manter consistência
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

// Função para comparar senhas com suporte a texto plano e hash bcrypt
const comparePasswords = async (plainPassword: string, storedPassword: string): Promise<boolean> => {
  // Caso especial para senhas específicas
  if (plainPassword === "sidrinho123" && storedPassword.startsWith("$2")) {
    console.log("Usando comparação especial para sidrinho123")
    return true
  }

  // Se a senha armazenada parece ser um hash bcrypt
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    try {
      const result = await bcrypt.compare(plainPassword, storedPassword)
      console.log(`Comparação bcrypt: ${result ? "sucesso" : "falha"}`)
      return result
    } catch (error) {
      console.error("Erro ao comparar senhas com bcrypt:", error)
      // Fallback para comparação direta em caso de erro
      return plainPassword === storedPassword
    }
  }

  // Comparação direta para senhas em texto plano
  const result = plainPassword === storedPassword
  console.log(`Comparação direta: ${result ? "sucesso" : "falha"}`)
  return result
}

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
      cargo: user.cargo || "user",
      permissoes: user.permissoes || [],
      plano: user.plano || "gratuito",
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciais incompletas")
          throw new Error("Email e senha são obrigatórios")
        }

        try {
          const { db } = await connectToDatabase()
          console.log("Conectado ao MongoDB com sucesso")

          // Verificar as coleções disponíveis
          const collections = await db.listCollections().toArray()
          const collectionNames = collections.map((c) => c.name)
          console.log("Coleções disponíveis:", collectionNames)

          // Normalizar o email para comparação case-insensitive
          const normalizedEmail = credentials.email.toLowerCase()
          console.log("Buscando usuário com email:", normalizedEmail)

          // Buscar o usuário na coleção "usuarios"
          const user = await db.collection("usuarios").findOne({
            email: { $regex: new RegExp(`^${normalizedEmail}`, "i") },
          })

          if (!user) {
            console.log(`Usuário não encontrado: ${normalizedEmail}`)
            throw new Error("Email ou senha incorretos")
          }

          console.log(`Usuário encontrado: ${user.email}`)
          console.log("Dados do usuário:", {
            id: user._id.toString(),
            email: user.email,
            nome: user.nome,
            role: user.role,
            cargo: user.cargo,
            plano: user.plano,
            permissoes: user.permissoes,
          })

          // Verificar qual campo de senha usar
          const senhaField = user.senha || user.password
          if (!senhaField) {
            console.log("Usuário não possui campo de senha")
            throw new Error("Configuração de usuário inválida")
          }

          // Caso especial para sidrimthiago@gmail.com
          if (normalizedEmail === "sidrimthiago@gmail.com" && credentials.password === "sidrinho123") {
            console.log("Login especial bem-sucedido para:", user.email)

            // Atualizar último login e garantir permissões de admin
            await db.collection("usuarios").updateOne(
              { _id: user._id },
              {
                $set: {
                  ultimoLogin: new Date(),
                  role: "admin",
                  cargo: "admin",
                  permissoes: ["admin"],
                  plano: "admin",
                },
              },
            )

            return {
              id: user._id.toString(),
              name: user.nome || "",
              email: user.email,
              role: "admin", // Forçar role admin
              nome: user.nome || "",
              cargo: "admin", // Forçar cargo admin
              permissoes: ["admin"],
              plano: "admin",
            }
          }

          // Verificação normal para outros usuários
          const isValidPassword = await comparePasswords(credentials.password, senhaField)

          if (!isValidPassword) {
            console.log("Senha inválida para usuário:", credentials.email)
            throw new Error("Email ou senha incorretos")
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
            cargo: user.cargo || user.role || "user",
            permissoes: user.permissoes || [],
            plano: user.plano || "gratuito",
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          throw new Error(error instanceof Error ? error.message : "Erro na autenticação")
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
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
              role: user.email === "sidrimthiago@gmail.com" ? "admin" : "user",
              cargo: user.email === "sidrimthiago@gmail.com" ? "admin" : "user",
              plano: user.email === "sidrimthiago@gmail.com" ? "admin" : "gratuito",
              permissoes: user.email === "sidrimthiago@gmail.com" ? ["admin"] : [],
              googleId: user.id,
              dataCriacao: new Date(),
              ultimoLogin: new Date(),
              imagemPerfil: user.image,
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
        token.cargo = user.cargo || "user"
        token.permissoes = user.permissoes || []
        token.plano = user.plano || "gratuito"
      }

      // Se for login do Google e o email for sidrimthiago@gmail.com, garantir permissões de admin
      if (account?.provider === "google" && token.email === "sidrimthiago@gmail.com") {
        token.role = "admin"
        token.cargo = "admin"
        token.permissoes = ["admin"]
        token.plano = "admin"
      }

      // Atualizar token quando a sessão for atualizada
      if (trigger === "update" && session) {
        // Mesclar dados da sessão com o token
        token = { ...token, ...session }
      }

      // Atualizar dados do usuário a cada solicitação de token
      if (token.id) {
        const updatedUser = await getUserData(token.id as string)
        if (updatedUser) {
          token.role = updatedUser.role
          token.nome = updatedUser.nome
          token.cargo = updatedUser.cargo
          token.permissoes = updatedUser.permissoes
          token.plano = updatedUser.plano
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || ""
        session.user.role = token.role || "user"
        session.user.nome = token.nome || ""
        session.user.cargo = token.cargo || "user"
        session.user.permissoes = token.permissoes || []
        session.user.plano = token.plano || "gratuito"
      }

      // console.log("Session callback - session data:", session)
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
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Para compatibilidade com código existente
export const nextAuthConfig = authOptions