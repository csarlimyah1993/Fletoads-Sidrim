import mongoose from "mongoose"

// Define a type for our cached connection
interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Define a type for the global object with our cached connection
declare global {
  var mongoConnection: CachedConnection | undefined
}

// Use cached connection for development to prevent multiple connections
const MONGODB_URI = process.env.MONGODB_URI

// Check if MONGODB_URI is defined
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

const cached = global.mongoConnection || { conn: null, promise: null }

if (process.env.NODE_ENV === "development") {
  global.mongoConnection = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    // Check if the connection is still alive
    if (mongoose.connection.readyState === 1) {
      console.log("Using cached database connection")
      return cached.conn
    } else {
      console.log("Cached connection is no longer active, reconnecting...")
      cached.conn = null
      cached.promise = null
    }
  }

  if (!cached.promise) {
    // TypeScript doesn't recognize that we've already checked MONGODB_URI above
    // So we need to create a non-null version of it
    const uri: string = MONGODB_URI! // Non-null assertion

    // Safe to use substring here since we've already checked MONGODB_URI is defined
    const uriPreview = uri.substring(0, 20) + "..."
    console.log(`Connecting to MongoDB at ${uriPreview}`)

    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  } else {
    console.log("Using existing connection promise")
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  // Add connection event listeners to handle reconnection
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected, will reconnect on next request")
    cached.conn = null
    cached.promise = null
  })

  return cached.conn
}

export default connectToDatabase

