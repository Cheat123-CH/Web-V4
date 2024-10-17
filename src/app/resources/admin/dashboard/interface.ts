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
