// Interface representing a list of data with pagination information
export interface List {
    data: Data[],
    pagination: {
        currentPage: number,
        perPage: number,
        totalItems: number,
        totalPages: number
    }
}

// Interface representing data for a receipt
export interface Data {

    id: number,
    receipt_number: number,
    total_price: number,
    ordered_at?: Date,
    cashier: { id: number, name: string },
    details: Detail[]
}

// Interface representing details of a product in a receipt
export interface Detail {
    id: number,
    unit_price: number,
    qty: number,
    product: { id: number, name: string }
}

