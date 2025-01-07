import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProductComponent } from "./product/product.component";
import { ProductTypeComponent } from "./product/type/type.component";
import { SaleComponent } from "./sale/sale.component";
import { UserComponent } from "./user/listing/component";

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
                component: ProductTypeComponent
            },
        ]
    },
    {
        path: 'users',
        component: UserComponent
    },

] as Routes;
