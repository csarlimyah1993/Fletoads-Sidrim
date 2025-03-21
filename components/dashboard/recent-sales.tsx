import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Sale {
  id: string
  customer: string
  amount: number
  status: string
  date: string
}

export interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://avatar.vercel.sh/${sale.customer.replace(/\s+/g, "-").toLowerCase()}`}
              alt={sale.customer}
            />
            <AvatarFallback>{sale.customer.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer}</p>
            <p className="text-sm text-muted-foreground">{new Date(sale.date).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="ml-auto font-medium">
            R$ {sale.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  )
}

