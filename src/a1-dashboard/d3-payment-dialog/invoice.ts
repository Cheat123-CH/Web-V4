export interface ZoneTypeInterface {
  id: number;
  name: string;
  created_at: Date;
}


export interface InvoiceInterface {
  success: Boolean;
  message: String;
  data: Invoice[]; // Match the API response shape
}

export interface Invoice {
  id: number;
  invNo: String;
  totalPriceKHR: number;
  totalPriceUSD: number;
  paidAmount: String;
  dueDate: number;
  createdAt: Date;
  userClosed: string;
  zoneName: string;
  roomCode: string;
  renterId: number;
  renterName: string;
  renterPhone: string;
}

export interface InvoiceDetail{
  data:{
  renter: { 
    id: number, 
    name: string,
    phone: string,
    avatarL: String;
  }
  room: {
    id: number,
    phone: string,
  }
  invoice_details:[
    id: number,
    name: string,
    quantity: number,
    price: number,
    total_price: number,
    price_unit: String,
    quantity_unit: String,
    createt_at: Date,
  ]
  invoice : {
    id: number;
    inv_no: string;
    total_price_khr: number;
    total_price_usd: number;
    due_date: string;
    status: string;
    invoice_type: string;
    invoice_status: string;
    paid_amount: number;
    created_at: string;
    creator_name: string;
  }
  };
}


// export interface Invoice {
//   // invoice_id: number;
//   // invoice_type_name: string;
//   // total_amount: string; // String since the data has quotes around the numbers
//   // paid: string;        // String for the same reason
//   // indebted: number;    // Number, as it appears to be a numeric value
//   // due_date: Date;    // ISO Date format as a string
// }



// export type InvoiceInterface = Invoice[]
// export interface Transaction {
//   transaction_id: number;
//   free_from: string;   // ISO Date format as a string
//   move_in: string;     // ISO Date format as a string
//   checkout: string | null; // Can be a string (ISO Date) or null
//   room_details: {
//     id: number;
//     code: string;
//     available: boolean;
//     zone: {
//         id: number;
//         name: string;
//     }
//   }
// }
