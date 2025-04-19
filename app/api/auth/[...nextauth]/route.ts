// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoClient, ObjectId } from "mongodb" // Import ObjectId separately
import bcrypt from "bcryptjs"

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

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
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

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.senha)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.nome || user.name,
            email: user.email,
            role: user.role || "user",
            image: user.image || null,
          }
        } catch (error) {
          console.error("Error in authorize:", error)
          return null
        } finally {
          if (client) {
            await client.close()
          }
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
          // Ensure role is always a string by providing a default value
          token.role = user.role || "user"
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string

        // Buscar informações adicionais do usuário
        let client
        try {
          const { client: mongoClient, db } = await connectToDatabase()
          client = mongoClient

          // Use the imported ObjectId class directly
          const user = await db.collection("usuarios").findOne({ _id: new ObjectId(token.id as string) })

          if (user) {
            // Garantir que a role do banco de dados seja usada
            session.user.role = user.role || "user"

            // Adicionar outros campos do usuário à sessão
            session.user.nome = user.nome || ""
            // Corrigido: Converter null para undefined para satisfazer o tipo
            session.user.emailVerificado = user.emailVerificado || false
            session.user.plano = user.plano || "gratuito"

            // Importante: não usar o campo cargo, usar apenas role
            // session.user.cargo = user.cargo || "user"

            if (user.permissoes) {
              // Corrigido: Garantir que permissoes é um array
              session.user.permissoes = Array.isArray(user.permissoes) ? user.permissoes : []
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }