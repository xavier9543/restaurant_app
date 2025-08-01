export type role = 'ADMIN' | 'WAITER';
export type permission = 'READ' | 'WRITE' | 'DELETE' | 'CREATE';

export interface User {
    fullName: string;
    id: string;
    name: string;
    email: string;
    role: role;
    isActive: boolean
}

export interface Option {
    name: string;   
    path: string;
    icon: string;
    permissions: permission[];
}

export interface LoginResponse {
    user: User;
    menu: Option[];
}