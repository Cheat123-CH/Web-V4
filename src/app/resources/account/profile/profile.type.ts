export interface ResponseProfile {
    statusCode: number;
    data: {
        token: string;
        user: {
            id: number;
            name: string;
            phone: string;
            email: string;
            avatar?: string;
        };
    };
    message: string;
}


export interface ProfileUpdate {
    name: string
    phone: string
    email: string
    avatar?: string
}

export interface PasswordUpdate {
    current_password: string
    new_passwrod: string
    confirm_password: string
}
