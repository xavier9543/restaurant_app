import { LoginResponse, Option, User, permission } from "@/app/interfaces";
import API from "./axios";

export const authenticateUser = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  const {data}: {data: LoginResponse} = await API.post(
    "/auth/login",
    {
      email,
      password,
    },
    { withCredentials: true }
  );

  console.log(data);
  
  

  if (data.user) {
    setCurrentUser(data);
  }

  return data.user ? data : null;
};

// Obtener usuario actual del localStorage
export const getCurrentUser = (): LoginResponse | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) as LoginResponse : null;
  } catch {
    return null;
  }
};

// Guardar usuario en localStorage
export const setCurrentUser = (data: LoginResponse | null) => {
  if (typeof window === "undefined") return;

  if (data) {
    localStorage.setItem("currentUser", JSON.stringify(data));
  } else {
    localStorage.removeItem("currentUser");
  }
};

// Cerrar sesión
export const logout = () => {
  setCurrentUser(null);
  window.location.href = "/";
};

// Verificar permisos por ruta
export const hasRouteAccess = (
  data: LoginResponse | null,
  path: string
): boolean => {
  if (!data) return false;

  // Rutas públicas
  const publicRoutes = ["/", "/login"];
  if (publicRoutes.includes(path)) return true;

  //   // Admin tiene acceso a todo
  //   if (data.user.role === "admin") return true

  // Rutas permitidas para meseros
  const allowedRoutes = data.menu.map((item) => item.path);
  return allowedRoutes.includes(`/${path.split("/")[2]}`);

  //   return meseroAllowedRoutes.some((route) => path.startsWith(route.permission))
};

// Verificar si puede realizar acciones CRUD en productos
export const canManage = (permission: permission): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  return currentUser.menu.some((option: Option) =>
    option.permissions.includes(permission)
  );
};


// // Verificar si puede ver estadísticas completas
// export const canViewFullStats = (user: User | null): boolean => {
//   return user?.role === "admin"
// }
