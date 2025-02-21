export interface MoveoutInterface{
  message: String;
  success: Boolean;
  data: Zone[];
}

export interface Zone {
    zoneId: number;
    zoneName: string;
    rooms: Room[];
  }
  
  export interface Room {
    room_id: number;
    room_code: string;
    available: boolean;
    transaction: Transaction[];
  }
  
  export interface Transaction {
    id: number;
    movein: Date;
    checkout: null | string; // Update type if checkout is not always null
    renter: Renter[];
  }
  
  export interface Renter {
    renter_id: number;
    renter_name: string;
    renter_phone: string;
  }
  