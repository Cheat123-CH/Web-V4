export interface User {
    id: number;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    roles: Role[];
}


export interface Role {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
}
