"use client"

import { Facebook, Instagram, Twitter, Linkedin, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { VitrineFooterProps } from "@/types/vitrine"

export function VitrineFooter({ loja, config }: VitrineFooterProps) {
  return (
    <footer
      className={cn("py-12 px-4", config?.tema === "escuro" ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800")}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Informações da Loja */}
          <div>
            <h4 className="font-bold text-lg mb-4">{loja.nome}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{loja.descricao || "Sua loja online"}</p>
            {config?.mostrarRedesSociais && (
              <div className="flex items-center gap-2 mt-4">
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="font-bold text-lg mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Sobre nós
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Produtos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Termos de Serviço
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-2">
              {loja.endereco && (
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>
                    {loja.endereco.rua || loja.endereco.logradouro}, {loja.endereco.numero}, {loja.endereco.bairro},{" "}
                    {loja.endereco.cidade} - {loja.endereco.estado}
                  </span>
                </li>
              )}
              {loja.contato?.telefone && (
                <li className="flex items-center">
                  <span className="mr-2">📞</span>
                  <span>{loja.contato.telefone}</span>
                </li>
              )}
              {loja.contato?.email && (
                <li className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <span>{loja.contato.email}</span>
                </li>
              )}
              {loja.horarioFuncionamento && (
                <li className="flex items-center">
                  <span className="mr-2">🕒</span>
                  <span>Seg - Sex: 9h às 18h</span>
                </li>
              )}
            </ul>
          </div>

          {/* Sobre FletoAds */}
          <div>
            <h4 className="font-bold text-lg mb-4">Sobre FletoAds</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              FletoAds é uma plataforma completa para criação de vitrines digitais e divulgação de produtos e serviços.
              Conectamos empresas aos seus clientes através de uma experiência digital moderna e personalizada.
            </p>
            <a
              href="https://fletoads.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Saiba mais
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0">
            Desenvolvido com ❤️ por{" "}
            <a href="https://fletoads.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              FletoAds
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}