"use client"

export function TermosHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-16 md:py-24">
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Termos e Políticas</h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
          Transparência é um dos nossos valores fundamentais. Aqui você encontra todos os documentos legais relacionados
          ao uso da plataforma FletoAds.
        </p>
      </div>
    </div>
  )
}
