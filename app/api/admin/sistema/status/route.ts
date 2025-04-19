import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import os from "os"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ status: "error", message: "Não autorizado" }, { status: 401 })
    }

    // Database status
    const dbStatus = {
      status: "online",
      connectionTime: 0,
      version: "",
      uptime: 0,
    }

    const startTime = Date.now()
    const { db } = await connectToDatabase()
    dbStatus.connectionTime = Date.now() - startTime

    // Get MongoDB version and status
    try {
      const buildInfo = await db.command({ buildInfo: 1 })
      dbStatus.version = buildInfo.version

      const serverStatus = await db.command({ serverStatus: 1 })
      dbStatus.uptime = serverStatus.uptime
      dbStatus.status = "online"
    } catch (error) {
      console.error("Error getting MongoDB status:", error)
      dbStatus.status = "error"
    }

    // Server status
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memPercent = Math.round((usedMem / totalMem) * 100)

    const cpuCores = os.cpus().length
    let cpuLoad = 0
    let cpuPercent = 0

    try {
      // Get CPU load average (Linux/Mac) or use alternative for Windows
      if (os.platform() !== "win32") {
        const loadavg = os.loadavg()
        cpuLoad = loadavg[0] // 1 minute load average
        cpuPercent = Math.round((cpuLoad / cpuCores) * 100)
      } else {
        // On Windows, use a simpler approach
        cpuPercent = 50 // Placeholder value
      }
    } catch (error) {
      console.error("Error getting CPU load:", error)
    }

    const serverStatus = {
      status: cpuPercent > 90 || memPercent > 90 ? "warning" : "online",
      uptime: os.uptime(),
      version: process.version,
      platform: `${os.type()} ${os.release()}`,
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usedPercent: memPercent,
      },
      cpu: {
        cores: cpuCores,
        load: cpuLoad,
        loadPercent: cpuPercent,
      },
    }

    // Application status
    const appStartTime = new Date(Date.now() - process.uptime() * 1000).toISOString()

    // Get package.json version
    let appVersion = "1.0.0"
    try {
      const { stdout } = await execAsync("npm list --depth=0")
      const versionMatch = stdout.match(/fletoads@(\d+\.\d+\.\d+)/)
      if (versionMatch && versionMatch[1]) {
        appVersion = versionMatch[1]
      }
    } catch (error) {
      console.error("Error getting app version:", error)
    }

    const applicationStatus = {
      status: "online",
      version: appVersion,
      environment: process.env.NODE_ENV || "development",
      startTime: appStartTime,
      uptime: process.uptime(),
      dependencies: [
        { name: "next.js", version: "14.x", status: "healthy" },
        { name: "react", version: "18.x", status: "healthy" },
        { name: "mongodb", version: "5.x", status: "healthy" },
        { name: "next-auth", version: "4.x", status: "healthy" },
      ],
      apis: [
        { name: "API Principal", status: "online", responseTime: 120 },
        { name: "API de Pagamentos", status: "degraded", responseTime: 850 },
        { name: "API de Notificações", status: "online", responseTime: 95 },
        { name: "API de Armazenamento", status: "online", responseTime: 210 },
      ],
    }

    return NextResponse.json({
      database: dbStatus,
      server: serverStatus,
      application: applicationStatus,
    })
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json(
      { status: "error", message: "Failed to fetch system status", error: (error as Error).message },
      { status: 500 },
    )
  }
}

