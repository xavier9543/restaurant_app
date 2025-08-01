"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, hasRouteAccess } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"
import { LoginResponse, role } from "@/app/interfaces/user.interface"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: role
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [data, setData] = useState<LoginResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setData(currentUser)
    setIsLoading(false)

    // Si no hay usuario y no está en login, redirigir
    if (!currentUser && pathname !== "/") {
      router.push("/")
      return
    }

    // Si hay usuario pero no tiene acceso a la ruta
    if (currentUser && !hasRouteAccess(currentUser, pathname)) {
      console.log(56);
      
      
      if (currentUser.user.role !== "admin") {
        router.push("/main/products")
        return
      } 
        router.push("/main/dashboard")
      return
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (currentUser && requiredRole && currentUser.user.role !== requiredRole) {
      router.push("/main/dashboard")
      return
    }
  }, [pathname, router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center">
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto text-primary-600 animate-pulse mb-4" />
              <p className="text-neutral-600">Verificando permisos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no hay usuario y está en login, mostrar el contenido
  if (!data?.user && pathname === "/login") {
    return <>{children}</>
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!data) {
    return null
  }

  // Si no tiene acceso a la ruta
  if (!hasRouteAccess(data, pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center p-4">
        <Card className="border-error-200 bg-white/90 backdrop-blur-sm max-w-md">
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-16 h-16 mx-auto text-error-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Acceso Denegado</h2>
            <p className="text-neutral-600 mb-4">No tienes permisos para acceder a esta página.</p>
            <p className="text-sm text-neutral-500">
              Rol actual: <span className="font-medium">{data.user.role === "admin" ? "Administrador" : "Mesero"}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
