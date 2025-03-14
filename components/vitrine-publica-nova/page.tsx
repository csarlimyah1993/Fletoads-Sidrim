import Image from "next/image"

export default function VitrinePublicaNova() {
  return (
    <div>
      <header>
        <nav>
          <Image src="/fleto-verde.svg" alt="Fleto" width={120} height={40} />
          {/* Rest of navigation items */}
        </nav>
      </header>

      <main>
        <h1>Bem-vindo à Vitrine Pública Fleto</h1>
        <p>Descubra ofertas incríveis e promoções exclusivas.</p>
        {/* Rest of main content */}
      </main>

      <footer>
        <p>&copy; 2024 Fleto. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

