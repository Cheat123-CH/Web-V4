// export interface Notification {
//     id: string;
//     icon?: string;
//     image?: string;
//     title?: string;
//     description?: string;
//     time: string;
//     link?: string;
//     useRouter?: boolean;
//     read: boolean;
// }

export interface Notification {
    id: number,
    receipt_number: number,
    total_price: number,
    ordered_at?: Date,
    cashier: { id: number, name: string, avatar: string },
    read: boolean;
}
