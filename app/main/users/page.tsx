"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Users, Search, Shield, UtensilsCrossed, UserCheck, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { User } from "@/app/interfaces"
import API from "@/lib/axios"
import { getCurrentUser } from "@/lib/auth"


const userSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "WAITER"]).refine((val) => val !== undefined, {
    message: "Selecciona un rol"
  }),
  isActive: z.boolean().default(true),
})

type UserFormData = z.infer<typeof userSchema>

function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "mesero">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as Resolver<UserFormData>,
  })

  useEffect(() => {
    // setCurrentUser(getCurrentUser())
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterRole, filterStatus])

  const fetchUsers = async () => {
    try {
      const response = await API.get<any>("/auth/users")
      console.log(response.data.data);
      
      setUsers(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por rol
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => 
        user.role === "ADMIN" ? filterRole === "admin" : filterRole === "mesero"
      )
    }

    // Filtrar por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => (filterStatus === "active" ? user.email : !user.email))
    }

    setFilteredUsers(filtered)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingUser(null)
      reset()
    }
  }

  const onSubmit = async (data: UserFormData) => {
    try {


      const {data:res} = await API.post<any>("/auth/register", data)
      console.log(res);
      if (res.status === 201) {
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario se ha creado correctamente",
        })
      }
      if (editingUser) {
        // await updateUser(editingUser.id, userData)
        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario se han actualizado correctamente",
        })
      } else {
        // await createUser(userData)
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario se ha creado correctamente",
        })
      }

      fetchUsers()
      handleDialogClose(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el usuario",
        variant: "destructive",
      })
    }
  }

  // const handleEdit = (user: User) => {
  //   setEditingUser(user)
  //   setValue("fullName", user.fullName)
  //   setValue("email", user.email)
  //   setValue("role", user.role === "ADMIN" ? "ADMIN" : "WAITER")
  //   setValue("isActive", user.isActive)
  //   setValue("password", "")
  //   setIsDialogOpen(true)
  // }

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) return

    try {
    //   await deleteUser(user.id)
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
const {data} = await API.patch<any>(`/auth/users/${user.id}/status`, {
  isActive: !user.isActive
})

      toast({
        title: user.email ? "Usuario desactivado" : "Usuario activado",
        description: `El usuario ${user.name} ha sido ${user.email ? "desactivado" : "activado"}`,
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  const getStats = () => {
    const totalUsers = users.length
    const activeUsers = users.filter((user) => user.isActive)
    const adminUsers = users.filter((user) => user.role === "ADMIN").length
    const meseroUsers = users.filter((user) => user.role === "WAITER").length

    return { totalUsers, activeUsers, adminUsers, meseroUsers }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-primary-600 animate-pulse mb-4" />
              <p className="text-lg text-neutral-600">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-neutral-600 mt-1">Administra los usuarios del sistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg w-full sm:w-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-neutral-900">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    {...register("fullName")}
                    placeholder="Ej: Juan Pérez"
                    className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.fullName&& <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="usuario@restaurant.com"
                    className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Ingrese una contraseña"
                    className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-neutral-700">
                    Rol
                  </Label>
                  <select
                    id="role"
                    {...register("role")}
                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="WAITER">Mesero</option>
                  </select>
                  {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="active"
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Label htmlFor="active" className="text-sm font-medium text-neutral-700">
                    Usuario activo
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    className="order-2 sm:order-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 bg-amber-600 hover:bg-amber-700 text-white flex-1 sm:flex-none"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Usuario"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-primary-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</div>
              <p className="text-xs text-neutral-600 mt-1">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="border-primary-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Usuarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-600">{stats.activeUsers.length}</div>
              <p className="text-xs text-neutral-600 mt-1">Pueden acceder al sistema</p>
            </CardContent>
          </Card>

          <Card className="border-accent-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-accent-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-600">{stats.adminUsers}</div>
              <p className="text-xs text-neutral-600 mt-1">Acceso completo</p>
            </CardContent>
          </Card>

          <Card className="border-info-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Meseros</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-info-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info-600">{stats.meseroUsers}</div>
              <p className="text-xs text-neutral-600 mt-1">Acceso limitado</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-primary-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-neutral-700">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterRole" className="text-sm font-medium text-neutral-700">
                  Filtrar por Rol
                </Label>
                <select
                  id="filterRole"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as "all")}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="mesero">Meseros</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus" className="text-sm font-medium text-neutral-700">
                  Filtrar por Estado
                </Label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Resultados</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <span className="text-sm text-neutral-600">
                    {filteredUsers.length} de {users.length} usuarios
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="border-primary-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12 sm:py-16">
                <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-500 text-lg sm:text-xl mb-2">
                  {users.length === 0 ? "No hay usuarios registrados" : "No se encontraron usuarios"}
                </p>
                <p className="text-neutral-400 text-sm sm:text-base">
                  {users.length === 0 ? "Crea el primer usuario para comenzar" : "Intenta con otros filtros"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className={`border-primary-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ${
                    !user.email ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar y info básica */}
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            user.role === "ADMIN"
                              ? "bg-gradient-to-r from-accent-500 to-error-500"
                              : "bg-gradient-to-r from-primary-500 to-info-500"
                          }`}
                        >
                          {user.fullName}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-900 text-base sm:text-lg truncate">
                              {user.fullName}
                            </h3>
                            {user.role === "ADMIN" ? (
                              <Shield className="w-4 h-4 text-accent-600" />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4 text-info-600" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 truncate">{user.email}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "ADMIN" ? "bg-accent-100 text-accent-800" : "bg-info-100 text-info-800"
                              }`}
                            >
                              {user.role === "ADMIN" ? "Administrador" : "Mesero"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.email ? "bg-primary-100 text-primary-800" : "bg-neutral-100 text-neutral-800"
                              }`}
                            >
                              {user.email ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user)}
                          className={`h-8 px-3 ${
                            user.isActive
                              ? "border-warning-300 text-warning-700 hover:bg-warning-50"
                              : "border-primary-300 text-primary-700 hover:bg-primary-50"
                          }`}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Desactivar</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Activar</span>
                            </>
                          )}
                        </Button>

                        {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8 p-0 border-info-300 text-info-700 hover:bg-info-50"
                        >
                          <Edit className="w-3 h-3" />
                        </Button> */}

                        {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user)}
                          className="h-8 w-8 p-0 border-error-300 text-error-700 hover:bg-error-50"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button> */}
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-500">
                        <div>
                          <span className="font-medium">Creado:</span>{" "}
                          {new Date(new Date()).toLocaleDateString("es-ES")}
                        </div>
                        <div>
                          <span className="font-medium">Actualizado:</span>{" "}
                          {new Date(new Date()).toLocaleDateString("es-ES")}
                        </div>
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

export default function UsersPage() {
  return (
      <UsersContent />
  )
}
