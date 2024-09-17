import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProductComponent } from "./product/product.component";
import { SaleComponent } from "./sale/sale.component";
import { ProductsTypeComponent } from "./product/type/type.component";

export default [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'pos',
        component: SaleComponent
    },
    {
        path: 'product',
        children: [
            {
                path: 'all',
                component: ProductComponent
            },
            {
                path: 'type',
                component: ProductsTypeComponent
            },
        ]
    },

] as Routes;
