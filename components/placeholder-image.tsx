interface PlaceholderImageProps {
    text?: string
    width?: number
    height?: number
    className?: string
  }
  
  export function PlaceholderImage({ text = "Image", width = 400, height = 400, className = "" }: PlaceholderImageProps) {
    return (
      <div
        className={`relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">{text}</span>
      </div>
    )
  }
  
  