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
