"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, ChefHat } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import API from "@/lib/axios"
import { canManage } from "@/lib/auth"

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
})

type ProductFormData = z.infer<typeof productSchema>

interface Product {
  id: number
  name: string
  price: number
  created_at: string
}

// URL de tu API de NestJS - cambiar por la URL real
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("products")
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

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingProduct(null)
      reset()
    }
  }

  const onSubmit = async (product: ProductFormData) => {
    try {
      const {id, ...payload} = product;
      console.log(payload);
      
      const {data} = id? await API.patch( `products/${id}`, payload) : await API.post('products', payload);
      
      if (data) {
        toast({
          title: "Éxito",
          description: editingProduct ? "Producto actualizado" : "Producto creado",
        })
        fetchProducts()
        handleDialogClose(false)
        setEditingProduct(null)
      } else {
        throw new Error("Error al guardar producto")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setValue("id", product?.id?.toString())
    setValue("name", product.name)
    setValue("price", product.price)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const response = await fetch(`${API_BASE_URL}products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Producto eliminado",
        })
        fetchProducts()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleDialogCloseOld = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    reset()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ChefHat className="w-12 h-12 mx-auto text-amber-600 animate-pulse mb-4" />
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              Gestión de Productos
            </h1>
            <p className="text-gray-600 mt-1">Administra el menú de tu restaurante</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              {canManage("CREATE")? (
                <Button
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg w-full sm:w-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
              ) : null}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre del Producto
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Hamburguesa Clásica"
                    className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Precio ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    className="order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 bg-amber-600 hover:bg-amber-700 text-white flex-1 sm:flex-none"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Producto"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-all duration-200 border-orange-200 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-start gap-2">
                  <span className="text-gray-900 text-base sm:text-lg leading-tight">{product.name}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 p-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">${!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : "0.00"}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Creado: {new Date(product.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg sm:text-xl mb-2">No hay productos registrados</p>
            <p className="text-gray-400 text-sm sm:text-base">Crea tu primer producto para comenzar a armar el menú</p>
          </div>
        )}
      </div>
    </div>
  )
}
