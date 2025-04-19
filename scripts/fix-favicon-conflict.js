const fs = require("fs")
const path = require("path")

// Check if there's a favicon in the public directory
const publicFaviconPath = path.join(process.cwd(), "public", "favicon.ico")
const publicFaviconExists = fs.existsSync(publicFaviconPath)

// Check if there's a favicon route in the app directory
const appFaviconPath = path.join(process.cwd(), "app", "favicon.ico")
const appFaviconExists = fs.existsSync(appFaviconPath)

if (publicFaviconExists && appFaviconExists) {
  console.log("Favicon conflict detected!")
  console.log("Both public/favicon.ico and app/favicon.ico exist.")
  console.log("Removing app/favicon.ico to resolve the conflict...")

  try {
    // Remove the app/favicon.ico directory
    fs.rmSync(appFaviconPath, { recursive: true, force: true })
    console.log("Successfully removed app/favicon.ico")
  } catch (error) {
    console.error("Error removing app/favicon.ico:", error)
  }
} else {
  console.log("No favicon conflict detected.")
}
