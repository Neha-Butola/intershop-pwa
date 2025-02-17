import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from 'ish-shared/shared.module';

import { AccountOrderFiltersComponent } from './account-order-filters/account-order-filters.component';
import { AccountOrderHistoryPageComponent } from './account-order-history-page.component';

const routes: Routes = [
  { path: '', component: AccountOrderHistoryPageComponent },
  {
    path: ':orderId',
    data: {
      breadcrumbData: [{ key: 'account.order_history.link', link: '/account/orders' }],
    },
    loadChildren: () => import('../account-order/account-order-page.module').then(m => m.AccountOrderPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [AccountOrderFiltersComponent, AccountOrderHistoryPageComponent],
})
export class AccountOrderHistoryPageModule {}
