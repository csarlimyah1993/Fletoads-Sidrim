// Function to generate a temporary image URL that works with Next.js Image component
export function getTempImageUrl(type: string, id: string): string {
  // Use local placeholder to avoid external domain issues
  return `/placeholder.svg?height=400&width=400&text=${type}-${id}`
}

// Function to get a blob URL for an image
export function getBlobImageUrl(path: string): string {
  // If the path is already a full URL, return it
  if (path.startsWith("http")) {
    return path
  }

  // Otherwise, construct a blob URL (this is just a placeholder implementation)
  return `/api/blob?path=${encodeURIComponent(path)}`
}

// Function to revoke a blob URL