const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Path to the .next directory
const nextDir = path.join(__dirname, "..", ".next")

console.log("Clearing Next.js cache...")

// Check if .next directory exists
if (fs.existsSync(nextDir)) {
  try {
    // Remove the .next directory
    if (process.platform === "win32") {
      // On Windows
      execSync(`rd /s /q "${nextDir}"`)
    } else {
      // On Unix-like systems
      execSync(`rm -rf "${nextDir}"`)
    }
    console.log(".next directory removed successfully.")
  } catch (error) {
    console.error("Error removing .next directory:", error)
    console.log("Trying alternative method...")

    // Alternative method using fs
    try {
      fs.rmSync(nextDir, { recursive: true, force: true })
      console.log(".next directory removed successfully using fs.rmSync.")
    } catch (fsError) {
      console.error("Error removing .next directory with fs.rmSync:", fsError)
      console.log("Please manually delete the .next directory and restart your development server.")
    }
  }
} else {
  console.log(".next directory does not exist. No need to clear cache.")
}

console.log("Cache clearing complete. Please restart your development server.")
