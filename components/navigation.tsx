"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Home, Package, ShoppingCart, BarChart3, Menu, X, Icon, LucideIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Option } from "@/app/interfaces"
import { getCurrentUser } from "@/lib/auth"
import { Logout } from "./logout"

export const iconMap: Record<string, LucideIcon> = {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Menu,
  Users,
  X
}

export function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [itemsMenu, setItemsMenu] = useState<Option[]>([
    {
      name: "Inicio", path: "/main", icon: "Home",
      permissions: []
    },
  ])


useEffect(() => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const defaultInicio = {
      name: "Inicio",
      path: "/main",
      icon: "Home",
      permissions: []
    };

    // Evitar duplicado si ya viene en el menú
    const hasInicio = currentUser.menu.some(item => item.path === "/main");

    const fullMenu = hasInicio
      ? currentUser.menu
      : [defaultInicio, ...currentUser.menu];

    setItemsMenu(fullMenu);
  }
}, []);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-gray-900 flex items-center gap-2" onClick={closeMenu}>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="hidden sm:inline">Restaurante App</span>
              <span className="sm:hidden">RA</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {itemsMenu.map((item) => {
                const Icon = iconMap[item.icon]
                const path = item.path !== '/main' ? `/main/${item.path}` : item.path;
                return (
                  <Link
                    key={item.name}
                    href={path}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === path
                        ? "bg-amber-100 text-amber-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 relative z-50"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </Button>

            <Logout/>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Outside of nav to avoid z-index issues */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeMenu} />

          {/* Menu Content */}
          <div className="fixed top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="container mx-auto px-4">
              <div className="py-2 space-y-1">
                {itemsMenu.map((item) => {
                const Icon = iconMap[item.icon]
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.path
                        ? "bg-amber-100 text-amber-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
