"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import  DatePicker  from "@/components/ui/date-picker"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

interface AffiliateModalProps {
  vitrineId: string
  vitrineName: string
  onClose: () => void
  onSuccess: () => void
}

export function AffiliateModal({ vitrineId, vitrineName, onClose, onSuccess }: AffiliateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const currentYear = new Date().getFullYear()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      address: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      // Validate the date
      if (isNaN(data.birthDate?.getTime() || 0)) {
        throw new Error("Data de nascimento inválida")
      }

      const response = await fetch("/api/affiliates/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          vitrineId,
          birthDate: data.birthDate.toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao afiliar-se")
      }

      toast.success("Afiliação realizada com sucesso!")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Erro ao afiliar-se")
    } finally {
      setIsLoading(false)
    }
  }

  // Format CPF as user types
  const formatCPF = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Apply the mask xxx.xxx.xxx-xx
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  // Format phone as user types
  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Apply the mask +xx (xx)xxxxx-xxxx
    if (digits.length <= 2) return `+${digits}`
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)})${digits.slice(4)}`
    if (digits.length <= 14)
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)})${digits.slice(4, 9)}-${digits.slice(9)}`
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)})${digits.slice(4, 9)}-${digits.slice(9, 13)}`
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Afiliar-se a {vitrineName}</DialogTitle>
          <DialogDescription>
            Torne-se um cliente afiliado e receba promoções exclusivas, novidades e muito mais!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value)
                          field.onChange(formatted)
                        }}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+55 (00)00000-0000"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          field.onChange(formatted)
                        }}
                        maxLength={19}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} onSelect={field.onChange} id="birthDate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando
                  </>
                ) : (
                  "Afiliar-se"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
