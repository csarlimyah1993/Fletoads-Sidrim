import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import { hash } from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await Usuario.findOne({ email: "adminfletoads@gmail.com" })

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        user: { email: existingAdmin.email, nome: existingAdmin.nome },
      })
    }

    // Hash the password
    const hashedPassword = await hash("kkZMk411WDkv", 10)

    // Create admin user
    const newAdmin = await Usuario.create({
      email: "adminfletoads@gmail.com",
      nome: "Admin FletoAds",
      senha: hashedPassword,
      role: "admin",
    })

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: { email: newAdmin.email, nome: newAdmin.nome, role: newAdmin.role },
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      {
        error: "Error creating admin user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

