import { DateTime } from "luxon";

export interface DashboardResponse {
    statatics: StataticData;
    message: string;
}
export interface StataticData {
    totalProduct: number;
    totalProductType: number;
    totalUser: number;
    totalOrder: number;
    total: string;
    totalPercentageIncrease: number;
    saleIncreasePreviousDay: string;
}

interface RoleDetails {
    id: number;
    name: string;
}

interface UserRole {
    id: number;
    role_id: number;
    role: RoleDetails;
}

export interface CashierData {
    id: number;
    name: string;
    avatar: string;
    totalAmount: number;
    percentageChange: number;
    role: UserRole[];
}

export interface DataCashierResponse {
    data: CashierData[];
}

export interface DataSaleResponse {
    labels: string[];
    data: number[];
}


// Management system interface:
export interface RoomSummary{
    success: String;
    message: String;
    data: 
        {roomAvailable: number;
        totalRoom: number;
        roomNotAvailable: number}
    ;
}

// Interface for the indebted details
interface IndebtedDetail {
    amount: string; // or number, depending on how you want to handle it
    paid: string;   // or number
}

// export interface RenterDashboard {
//     count: number;
//     renterStatistics: RenterStatistics[];
// }

export interface RenterStatistics{
    sucess: String;
    message: String;
    data: RenterInfo[]    
}

export interface RenterInfo{
    renterId: number;
    renterName: string;
    renterPhone: string;
    transactions: TransactionRenter[];
    invoices: Invoice[];
}

export interface TransactionRenter{
    transactionId: number;
    downPayment: string;
    roomId: number;
    roomCode: string;
    roomAvailable: boolean;
    zoneName: string;
    roomType: string;
    moveIn: Date;
    checkout: string;
}


//Zone statistics dashboard
export type ZoneStatisticsResponse = Zone;
  
export interface Zone {
    sucess: String;
    message: String;
    data: {
        zoneId: number;
        zoneName: string;
        totalRooms: number;
        notavailableRooms: number;
        availableRooms: number;
        percentNotAvailable: number;
        totalPaidAmount: number;
        totalPrice: number;
        totalPriceUSDUnpaidAmount: number;
    }[];
}

export interface ZoneData{
    zoneId: number ,
    zoneName: string ,
    totalRooms: number ,  
    notavailableRooms: number ,
    availableRooms: number ,
    percentNotAvailable: number ,
    totalPaidAmount: number ,
    totalPrice: number ,
    totalPriceUSDUnpaidAmount: number ,
}
// export interface Renters {
//     renterId: number; // Unique identifier for the renter
//     roomName: string; // Name of the room rented by the renter
//     renterPhone: string; // Phone number of the renter
//     roomCode: string; // Code identifying the rented room
//     invoices: Invoice[]; // List of invoices associated with the renter
// }

export interface Invoice {
    id: number; // Unique identifier for the invoice
    type: string; // Type of the invoice (e.g., electricity, rent)
    total_amount: number; // Total amount on the invoice
    paid: number; // Amount paid towards the invoice
    indebted: number; // Outstanding amount on the invoice
}

export interface BarChart{
    data:{
        year: number;
        statistics: BarStatistics[]
    };
}

export interface BarStatistics{
    month: number;
    totalIncomeKHR: number;
    totalExpenseKHR: number;
    totalIncomeUSD: number;
    totalExpenseUSD: number;
}
//new

// export interface ZoneStatistic {
//     ZoneStatistic:[
//         zoneId: string, // Unique identifier for the zone
//         zoneName: string, // Name of the zone
//         totalRoom: number, // Total number of rooms in the zone
//         availableRooms: number, // Number of available rooms in the zone
//         totalIndebted: number, // Total indebted amount for the zone
//         renters: Renter[], // List of renters associated with the zone        
//     ]
//     }





//==================================> Dashboard V2
export interface DashboardStatisticsV2{
    success : boolean,
    message : string,
    data    : {
        object_1 : {
            rooms   : RoomStatisticsV2[];
            invoices: InvoiceStatisticsV2[];
            expenses: ExpenseStatisticsV2[];
        }
        object_2 : {
            zones    : ZoneStatisticsV2[];
        }
    }
}

export interface RoomStatisticsV2{
    status  : string,
    count   : number,
}

export interface InvoiceStatisticsV2{
    status  : string,
    count   : number,
}

export interface ExpenseStatisticsV2{
    status  : string,
    count   : number,
}

export interface ZoneStatisticsV2{
    zone : {
        id : number, 
        name : string,
    }
    rooms    : RoomStatisticsType[];
    invoices : InvoiceStatisticsV2[];
    prices   : {
        totalPriceKHRPaid : number,
        totalPriceUSDPaid : number,
        totalPriceUSDUnpaidAmount : number,
        totalPriceKHRUnpaidAmount : number,
    }
}

export interface RoomStatisticsType{
    status     : string,
    count      : number,
    percent    : number,
    totalRooms : number
}


//Renter Dashboard
export interface RenterDashboardInterface{
    status  : boolean,
    message : string,
    data    : RenterDashboard[],
}

export interface RenterDashboard{
    renter      : {
        id        : number,
        name      : string,
        phone     : string,
        createdAt : string,
    }
    room        : {
        id        : number,
        code      : string,
        status    : string, 
    }
    transaction : {
        id        : number,
        freeFrom  : string,
        moveIn    : string,
        checkout  : string,
    }
    invoice       : InvoiceRenter[]
}

export interface InvoiceRenter{
    id            : number,
    invNo         : string,
    paidAmount    : number,
    totalPriceKHR : number,
    totalPriceUSD : number, 
    dueDate       : string,
}


//-----------> invoice info before create
export interface InvoiceInfoInterface{
    success : boolean,
    message : string,
    data    : {
        close_invoice    : {
            id           : number,
            creator_id   : number,
            creator_name : string,
            created_at   : string,
            updated_at   : string,
            last_created : {
                days     : number,
                hours    : number
                minutes  : number,
                seconds  : number,
            }
        }
    invoice_counts       : number,
    }
}

