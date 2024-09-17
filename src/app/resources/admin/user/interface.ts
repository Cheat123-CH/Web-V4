export interface List {
    data: User[],
    pagination: {
        currentPage: number,
        perPage: number,
        totalItems: number,
        totalPages: number
    }
}

export interface Role {
    id: number;
    name: string;
}

export interface UserRole {
    id: number;
    role: Role;
}

export interface User {
    id: number;
    avatar?: string;
    name: string;
    email?: string | null;
    phone: string;
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
    roles: UserRole[];
}


// interface ParentInterface {
//     id: number,
//     kh_name: string,
//     en_name: string,
//     abbre?: string
// }

export interface RequestUser {
    name: string,
    phone: string,
    email: string,
    sex_id: number,
    role_ids: number,
    password: string,
    avatar: string,
}

export interface ResponseUser {
    statusCode: string,
    data: User,
    message: string
}

export interface RequestPutUser {
    name: string,
    phone: string,
    email: string,
    sex_id: number,
    role_ids: number,
    avatar?: string,
    roles : { id: number, name: string },
}

export interface ReqPutPassword {
    newPassword: string,
    newConfirmPassword: string
}

export interface ResPutPassword {
    statusCode: number,
    message: string
}

export interface OrgSetup {
    id: number;
    kh_name: string;
    en_name: string;
    abbre: string;
    organization_id: number;
    representation_id: number;
    icon: string;
    created_at: Date;
    updated_at: Date;
}
export interface TitleSetup {
    id: number;
    name: string;
    abbre: string;
    created_at: Date;
    updated_at: Date;
}
export interface RoleSetup {
    id: number;
    kh_name: string;
    en_name: string;
    created_at: Date;
    updated_at: Date;
}
