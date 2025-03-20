import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Create the NextAuth handler with the auth options
const handler = NextAuth(authOptions)

// Export the handler and the authOptions
export { handler as GET, handler as POST, authOptions }

