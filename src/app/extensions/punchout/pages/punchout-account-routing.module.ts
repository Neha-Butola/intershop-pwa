import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./account-punchout/account-punchout-page.module').then(m => m.AccountPunchoutPageModule),
  },
  {
    path: 'configuration',
    loadChildren: () =>
      import('./account-punchout-configuration/account-punchout-configuration-page.module').then(
        m => m.AccountPunchoutConfigurationPageModule
      ),
  },
  {
    path: 'create',
    loadChildren: () =>
      import('./account-punchout-create/account-punchout-create-page.module').then(
        m => m.AccountPunchoutCreatePageModule
      ),
  },
  {
    path: ':PunchoutLogin',
    loadChildren: () =>
      import('./account-punchout-details/account-punchout-details-page.module').then(
        m => m.AccountPunchoutDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PunchoutAccountRoutingModule {}
