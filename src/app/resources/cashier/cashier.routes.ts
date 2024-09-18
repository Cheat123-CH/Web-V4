import { Routes } from "@angular/router";
import { OrderComponent } from "./order/order.component";
import { SaleComponent } from "./sale/sale.component";

export default [
    {
        path: 'order',
        component: OrderComponent
    },
    {
        path: 'pos',
        component: SaleComponent
    },
] as Routes;
