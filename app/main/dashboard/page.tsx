
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, DollarSign, Package, TrendingUp, Clock, Plus, BarChart3, UtensilsCrossed } from "lucide-react"
import { Order } from "@/app/interfaces"
import API from "@/lib/axios"




export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    
    try {
      const {data} = await API.get('/orders')
      if (data) {
        setOrders(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

const getTotalRevenue = () => {
  return orders.reduce((total, order) => total + parseFloat(order.total.toString()), 0);
};


  const getTotalOrders = () => {
    return orders.length
  }

 const getTotalItems = () => {
  return orders.reduce(
    (total, order: Order) =>
      total +
      order.orderItems.reduce(
        (itemTotal: number, item: any) => itemTotal + item.quantity,
        0
      ),
    0
  );
};


  const getAverageOrderValue = () => {
    return orders.length > 0 ? getTotalRevenue() / orders.length : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-amber-600 animate-pulse mb-4" />
              <p className="text-lg text-gray-600">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            Dashboard de Gestión
          </h1>
          <p className="text-gray-600">Panel principal para administrar tu restaurante</p>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <Package className="w-10 h-10 mx-auto text-amber-600 mb-3" />
              <CardTitle className="text-lg">Gestión de Productos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href="/products">
                  <Package className="w-4 h-4 mr-2" />
                  Administrar Productos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <ShoppingCart className="w-10 h-10 mx-auto text-orange-600 mb-3" />
              <CardTitle className="text-lg">Crear Orden</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/orders/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Orden
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-red-600 mb-3" />
              <CardTitle className="text-lg">Vista Completa</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Órdenes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Estadísticas de Ventas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Órdenes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{getTotalOrders()}</div>
                <p className="text-xs text-gray-600 mt-1">Órdenes procesadas</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${getTotalRevenue()?.toFixed(2)}</div>
                <p className="text-xs text-gray-600 mt-1">Ventas acumuladas</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Productos Vendidos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{getTotalItems()}</div>
                <p className="text-xs text-gray-600 mt-1">Unidades totales</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Promedio por Orden</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">${getAverageOrderValue().toFixed(2)}</div>
                <p className="text-xs text-gray-600 mt-1">Valor promedio</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de órdenes */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Órdenes Recientes
          </h2>

          {orders.length === 0 ? (
            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12 sm:py-16">
                <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg sm:text-xl mb-2">No hay órdenes registradas</p>
                <p className="text-gray-400 text-sm sm:text-base mb-6">Crea tu primera orden para comenzar</p>
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/main/orders/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Orden
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order, i: number) => (
                <Card
                  key={order.id}
                  className="border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">Orden #{i + 1}</span>
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-amber-600">  ${!isNaN(Number(order.total)) ? Number(order.total).toFixed(2) : '0.00'}</div>
                        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt || Date.now()).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm sm:text-base">Productos ordenados:</h4>
                      <div className="grid gap-2">
                        {order.orderItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-orange-100"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900 text-sm sm:text-base block truncate">
                                {item.product.name}
                              </span>
                              <span className="text-gray-600 text-xs sm:text-sm">x {item.quantity}</span>
                            </div>
                            <span className="font-bold text-amber-600 text-sm sm:text-base ml-3">
                              ${( item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}