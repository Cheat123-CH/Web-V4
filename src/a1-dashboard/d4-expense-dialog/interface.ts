export interface ExpenseInterface {
    success: boolean;
    message: String;
    data : Expense[]
}

export interface Expense{
    id: number ,
    expNo: String ,
    expenseType: String ,
    expenseStatus: String ,
    totalPriceKHR: String ,
    totalPriceUSD: String,
    paidAmount: String ,
    paymentDate: String ,
    dueDate: String ,
    description: String ,
    createdAt: String ,
    vendor: {
        id: number ,
        name: String ,
        avatar: String ,
        email: String ,
        phone: String ,
    } ,
    expenseDetails : ExpenseDetail[]

}
export interface ExpenseDetail{
    id: number;
    ref_no: String;
    name: String;
    value: number;
    price: number;
    total_price: String;
}

export interface ExpenseViewInterface{
    success: boolean;
    message: String;
    data : Expense
}