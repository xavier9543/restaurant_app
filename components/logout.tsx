"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser, logout,  } from "@/lib/auth"
import { LogOut, UserIcon, Shield, UtensilsCrossed } from "lucide-react"
import { User } from "@/app/interfaces"

export function Logout() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)

 useEffect(() => {
  const currentUser = getCurrentUser();
  console.log(currentUser?.user);
  
  setUser(currentUser?.user ?? null);
}, []);

  if (!user) return null

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-primary-50 gap-2 text-neutral-700 hover:text-neutral-900"
      >
        <span className="hidden sm:inline font-medium">{user.fullName}safsd</span>
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 border-primary-200 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{user.fullName}</p>
                    <p className="text-sm text-neutral-600 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg">
                  {user.role === "ADMIN" ? (
                    <Shield className="w-4 h-4 text-primary-600" />
                  ) : (
                    <UtensilsCrossed className="w-4 h-4 text-accent-600" />
                  )}
                  <span className="text-sm font-medium text-neutral-700">
                    {user.role === "ADMIN" ? "Administrador" : "Mesero"}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-error-600 hover:text-error-700 hover:bg-error-50 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
