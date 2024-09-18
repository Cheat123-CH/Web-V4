export interface List {
    data            : Data[],
    pagination: {
        currentPage: number,
        perPage: number,
        totalItems: number,
        totalPages: number
    }
}

export interface Data {
    id          : number,
    type_id?    : number,
    code        : string,
    name        : string,
    image       : string,
    unit_price  : number,
    created_at  : Date,
    type: { id  : number, name: string }
}

