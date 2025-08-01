"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authenticateUser, setCurrentUser } from "@/lib/auth"
import { LogIn, UtensilsCrossed } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await authenticateUser(email, password)
      
      if (data) {
        setCurrentUser(data)
        toast({
          title: "¡Bienvenido!",
          description: `Sesión iniciada como ${data.user.role === "ADMIN" ? "Administrador" : "Mesero"}`,
        })
        router.push("/main/dashboard")
      } else {
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary-200 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900">Iniciar Sesión</CardTitle>
          <CardDescription className="text-neutral-600">Accede al sistema de gestión del restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@restaurant.com"
                required
                className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5"
            >
              {isLoading ? (
                "Iniciando sesión..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
