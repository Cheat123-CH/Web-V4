export interface ResponseProfile {
    token: string;
    message: string;
}

export interface ProfileUpdate {
    name: string
    phone: string
    email: string
    avatar?: string
}

export interface PasswordReq {
    password: string;
    confirm_password: string;
}
export interface List {
    data: Data[],
    pagination: {
        currentPage: number,
        perPage: number,
        totalItems: number,
        totalPages: number
    }
}

export interface Data {
    id: number;
    action: string;
    details: string;
    ip_address: string;
    browser: string;
    os: string;
    platform: string;
    timestamp: string; // ISO date string
}

