import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import mongoose from "mongoose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          // Connect directly to MongoDB
          const MONGODB_URI = process.env.MONGODB_URI
          if (!MONGODB_URI) {
            console.error("MONGODB_URI environment variable is not defined")
            return null
          }

          console.log(`Connecting to MongoDB at ${MONGODB_URI.substring(0, 20)}...`)

          // Connect to MongoDB
          await mongoose.connect(MONGODB_URI)
          console.log("Connected to MongoDB successfully")

          // Get the actual collection name for usuarios
          let collectionName = "usuarios"
          if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            const collections = await mongoose.connection.db.listCollections().toArray()
            const usuarioCollection = collections.find(
              (c) => c.name.toLowerCase().includes("usuario") || c.name.toLowerCase().includes("users"),
            )

            if (usuarioCollection) {
              collectionName = usuarioCollection.name
            }
          }

          console.log(`Using collection name: ${collectionName}`)

          // Define the Usuario schema directly
          const usuarioSchema = new mongoose.Schema({
            nome: String,
            email: String,
            senha: { type: String, select: false },
            role: String,
            plano: { type: mongoose.Schema.Types.ObjectId, ref: "Plano" },
          })

          // Get the model with the correct collection name
          const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema, collectionName)

          console.log(`Attempting to find user with email: ${credentials.email}`)

          // Find the user WITH password field explicitly selected
          const user = await UsuarioModel.findOne({ email: credentials.email }).select("+senha")

          if (!user) {
            console.log(`User not found with email: ${credentials.email}`)
            return null
          }

          console.log(`User found: ${user.nome}, role: ${user.role}`)

          // Get the raw user document to check the password
          let isPasswordValid = false

          if (mongoose.connection.db) {
            const userDoc = await mongoose.connection.db
              .collection(collectionName)
              .findOne({ email: credentials.email })

            // Check for common password field names
            const possiblePasswordFields = ["senha", "password", "hash", "passwordHash"]

            for (const field of possiblePasswordFields) {
              if (userDoc && userDoc[field]) {
                const storedPassword = userDoc[field]
                console.log(`Found password in field: ${field}, value: ${storedPassword}`)

                // Check if the stored password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
                if (
                  typeof storedPassword === "string" &&
                  (storedPassword.startsWith("$2a$") ||
                    storedPassword.startsWith("$2b$") ||
                    storedPassword.startsWith("$2y$"))
                ) {
                  // If it's hashed, use bcrypt.compare
                  console.log("Password appears to be hashed, using bcrypt.compare")
                  isPasswordValid = await compare(credentials.password, storedPassword)
                } else {
                  // If it's not hashed, do a direct comparison
                  console.log("Password appears to be plain text, doing direct comparison")
                  isPasswordValid = credentials.password === storedPassword
                }

                console.log(`Password validation result: ${isPasswordValid}`)

                if (isPasswordValid) {
                  break // Stop checking if we found a valid password
                }
              }
            }
          }

          if (!isPasswordValid) {
            console.log("Invalid password")
            return null
          }

          // Get plan data if needed
          let planoData = undefined
          if (user.plano) {
            try {
              const planoSchema = new mongoose.Schema({
                nome: String,
                slug: String,
                ativo: Boolean,
                dataInicio: Date,
                dataFim: Date,
              })

              const PlanoModel = mongoose.models.Plano || mongoose.model("Plano", planoSchema)

              const plano = await PlanoModel.findById(user.plano)

              if (plano) {
                planoData = {
                  id: plano._id.toString(),
                  nome: plano.nome,
                  slug: plano.slug,
                  ativo: plano.ativo,
                  dataInicio: plano.dataInicio,
                  dataFim: plano.dataFim,
                }
              }
            } catch (error) {
              console.error("Error fetching plan:", error)
            }
          }

          console.log("Authentication successful")

          // Return user data
          return {
            id: user._id.toString(),
            nome: user.nome,
            email: user.email,
            role: user.role,
            plano: planoData,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        } finally {
          // Close the connection
          if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect()
            console.log("Disconnected from MongoDB")
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.plano = user.plano
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

