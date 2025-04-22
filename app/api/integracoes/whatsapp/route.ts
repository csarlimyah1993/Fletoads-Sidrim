import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import Loja from "@/lib/models/loja"

// Listar integrações do WhatsApp

// Criar nova integração do WhatsApp

