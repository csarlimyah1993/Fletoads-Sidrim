"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { Logo } from "@/components/logo"

export function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
          <Link href="/admin" className="flex items-center space-x-2">
            <Logo showText={true} className="hidden sm:flex" />
            <Logo showText={false} className="sm:hidden" />
          </Link>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">FletoAds Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600"></span>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  )
}

