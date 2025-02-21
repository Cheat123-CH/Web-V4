export interface FreeRoom {
    message: string;
    count: number;
    data: FreeRoomInterface[];
}

export interface FreeRoomInterface {
    id: number;
    zone: string;
    code: string;
    available: boolean;
    price: number;
    booked_price: number;
}

export interface RoomInfo{
    success: String;
    message: String;
    data:{
        id: number;
        code: String;
        type: String;
        zone: String;
        booked_price: number;
        rent_price: number;
        available: boolean;
        s1: number;
        s2: number;
        s3: number;
        created_at: String;
    }
}