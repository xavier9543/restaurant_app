"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, ShoppingCart, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { Product, OrderItem } from "@/app/interfaces"
import API from "@/lib/axios"
import { canManage } from "@/lib/auth"

export default function CreateOrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const {data} = await API.get('/products')
      if (data) {
        setProducts(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToOrder = (product: Product) => {
    setOrderItems((prev: OrderItem[]): OrderItem[] => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1, price: product.price }]
    })
  }

  const removeFromOrder = (productId: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prev.filter((item) => item.product.id !== productId)
    })
  }

  const getTotal = () => {
    return orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const createOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto a la orden",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const orderData = {
        items: orderItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }

      const {data} = await API.post('/orders', orderData)
      console.log(data);
      
      if (data) {
        toast({
          title: "¡Orden creada!",
          description: "La orden se ha registrado exitosamente",
        })
        router.push("/main/dashboard")
      } else {
        throw new Error("Error al crear orden")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la orden",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto text-amber-600 animate-pulse mb-4" />
              <p className="text-lg text-gray-600">Cargando productos...</p>
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
            <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            Crear Nueva Orden
          </h1>
          <p className="text-gray-600">Selecciona productos del menú para crear una orden</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Productos disponibles */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Productos Disponibles
            </h2>

            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-all duration-200 border-orange-200 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="flex items-center justify-between p-3 sm:p-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-amber-600 font-bold text-lg sm:text-xl">${!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : '0.00'}</p>
                    </div>
                    <Button
                      onClick={() => addToOrder(product)}
                      className="bg-amber-600 hover:bg-amber-700 text-white ml-3 flex-shrink-0"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Orden actual */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card className="border-orange-200 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Orden Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <UtensilsCrossed className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg">No hay productos en la orden</p>
                    <p className="text-gray-400 text-sm">Agrega productos del menú</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto space-y-3">
                      {orderItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h4>
                            <p className="text-xs text-gray-600">${!isNaN(Number(item.product.price)) ? Number(item.product.price).toFixed(2) : '0.00'} c/u</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromOrder(item.product.id)}
                              className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToOrder(item.product)}
                              className="h-8 w-8 p-0 border-amber-300 text-amber-600 hover:bg-amber-50"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <span className="w-16 text-right font-medium text-sm">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-amber-600">${getTotal().toFixed(2)}</span>
                      </div>
                      {canManage("CREATE") && (
                        <Button
                          onClick={createOrder}
                          disabled={creating}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 text-base font-semibold shadow-lg"
                        >
                          {creating ? "Procesando..." : "Cerrar Orden"}
                        </Button>
                      )}
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
