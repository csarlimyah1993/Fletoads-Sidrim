import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

const handler = NextAuth({
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

          await connectToDatabase()

          // Buscar o usuário pelo email
          const user = await UsuarioModel.findOne({ email: credentials.email })

          if (!user) {
            console.log("Usuário não encontrado:", credentials.email)
            return null
          }

          // Verificar se o campo senha existe no usuário
          if (!user.senha) {
            console.log("Usuário não possui senha definida")
            return null
          }

          console.log("Tentando autenticar usuário:", credentials.email)
          console.log("Senha fornecida (primeiros 3 caracteres):", credentials.password.substring(0, 3) + "...")
          console.log("Senha armazenada (primeiros 10 caracteres):", user.senha.substring(0, 10) + "...")

          let isPasswordValid = false

          // Verificar se a senha armazenada é um hash bcrypt (começa com $2a$ ou $2b$)
          if (user.senha.startsWith("$2a$") || user.senha.startsWith("$2b$")) {
            // Se for um hash bcrypt, usar bcrypt.compare
            console.log("Senha armazenada é um hash bcrypt, usando bcrypt.compare")
            isPasswordValid = await bcrypt.compare(credentials.password, user.senha)
          } else {
            // Se não for um hash bcrypt, comparar diretamente (texto plano)
            console.log("Senha armazenada não é um hash bcrypt, comparando diretamente")
            isPasswordValid = credentials.password === user.senha
          }

          console.log("Resultado da comparação de senha:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("Senha inválida para usuário:", credentials.email)
            return null
          }

          console.log("Autenticação bem-sucedida para:", user.email)

          // Retornar os dados do usuário para a sessão
          return {
            id: user._id.toString(),
            name: user.nome,
            email: user.email,
            role: user.role,
            nome: user.nome,
            cargo: user.cargo,
            permissoes: user.permissoes,
            plano: user.plano,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nome = user.nome
        token.cargo = user.cargo
        token.permissoes = user.permissoes
        token.plano = user.plano
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.nome = token.nome
        session.user.cargo = token.cargo
        session.user.permissoes = token.permissoes
        session.user.plano = token.plano
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
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

