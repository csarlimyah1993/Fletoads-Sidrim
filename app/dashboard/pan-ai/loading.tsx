export default function Loading() {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <h1 className="text-2xl font-bold mb-6">Pan AI</h1>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  