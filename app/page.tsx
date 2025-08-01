"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { UtensilsCrossed } from "lucide-react"
import { LoginResponse, User } from "./interfaces"

export default function HomePage() {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      
    }
    setIsLoading(false)
    
    // Si ya hay un usuario autenticado, redirigir al dashboard
    if (currentUser) {
      router.push("/main/dashboard")
    }
  }, [router])
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center">
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <UtensilsCrossed className="w-8 h-8 mx-auto text-primary-600 animate-pulse mb-4" />
              <p className="text-neutral-600">Cargando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <LoginForm />
  }

  // Si hay usuario, no mostrar nada (se redirigirá)
  return null
}
