"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    pergunta: "Como escolher o plano ideal para o meu negócio?",
    resposta:
      "Avalie o tamanho do seu negócio, seu orçamento e suas necessidades específicas. O plano Básico é o mais popular e atende à maioria dos negócios de pequeno e médio porte. Se você está apenas começando, o plano Grátis ou Start pode ser uma boa opção. Para negócios maiores com necessidades mais complexas, recomendamos os planos Completo, Premium ou Empresarial.",
  },
  {
    pergunta: "Posso mudar de plano depois?",
    resposta:
      "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, você terá acesso imediato aos novos recursos. Ao fazer downgrade, você manterá o plano atual até o final do período de faturamento.",
  },
  {
    pergunta: "O que é o Tour Virtual 360°?",
    resposta:
      "O Tour Virtual 360° é uma experiência imersiva que permite aos seus clientes explorarem seu estabelecimento virtualmente, como se estivessem lá pessoalmente. Utilizamos tecnologia de fotografia 360° para criar uma experiência interativa que aumenta o engajamento e a confiança dos clientes.",
  },
  {
    pergunta: "Como funciona o Pan Assistente com IA?",
    resposta:
      "O Pan Assistente é um assistente virtual alimentado por inteligência artificial que pode responder perguntas dos clientes, fornecer informações sobre produtos e serviços, e até mesmo ajudar com vendas. Ele aprende com as interações e se torna mais inteligente com o tempo. Os níveis Básico, Completo e Premium oferecem diferentes capacidades e personalizações.",
  },
  {
    pergunta: "Quais são as formas de pagamento aceitas?",
    resposta:
      "Aceitamos cartões de crédito, débito, boleto bancário e PIX. Você pode escolher a forma de pagamento que for mais conveniente para você durante o processo de checkout.",
  },
  {
    pergunta: "Existe algum período de teste?",
    resposta:
      "Sim, oferecemos um período de teste gratuito de 14 dias para todos os planos pagos. Durante esse período, você terá acesso a todos os recursos do plano escolhido para avaliar se ele atende às suas necessidades.",
  },
  {
    pergunta: "O que acontece se eu exceder o limite de produtos/panfletos do meu plano?",
    resposta:
      "Se você atingir o limite do seu plano, você pode fazer upgrade para um plano superior ou adquirir pacotes adicionais para expandir sua capacidade sem precisar mudar de plano.",
  },
  {
    pergunta: "Como funciona o suporte técnico?",
    resposta:
      "Todos os planos incluem suporte técnico por email. Os planos Básico e superiores também incluem suporte por chat. Os planos Premium e Empresarial incluem suporte prioritário por telefone e um gerente de conta dedicado.",
  },
]

export function PlanosFAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Perguntas Frequentes</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-gray-300">
          Encontre respostas para as dúvidas mais comuns sobre nossos planos e serviços
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left dark:text-white">{faq.pergunta}</AccordionTrigger>
              <AccordionContent className="dark:text-gray-300">{faq.resposta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4 dark:text-gray-400">Ainda tem dúvidas?</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
          Entre em contato
        </Button>
      </div>
    </div>
  )
}

