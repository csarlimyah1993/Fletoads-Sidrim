import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase() // Converte para minúsculas
    .trim() // Remove espaços no início e fim
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/[^\w-]+/g, "") // Remove caracteres não alfanuméricos
    .replace(/--+/g, "-") // Substitui múltiplos hífens por um único
    .replace(/^-+/, "") // Remove hífens do início
    .replace(/-+$/, "") // Remove hífens do fim
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date | string): string {
  if (!date) return ""

  const d = new Date(date)
  return new Intl.DateTimeFormat("pt-BR").format(d)
}

