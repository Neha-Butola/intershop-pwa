import { NgModule } from "@angular/core";
import { CheckoutMainComponent } from "./checkout-main.component";
import { CheckoutAddressPageModule } from "../checkout-address/checkout-address-page.module";
import { CheckoutShippingPageModule } from "../checkout-shipping/checkout-shipping-page.module";
import { CheckoutPaymentPageModule } from "../checkout-payment/checkout-payment-page.module";
import { SharedModule } from "ish-shared/shared.module";

@NgModule({
    imports: [
        CheckoutAddressPageModule, 
        CheckoutShippingPageModule, 
        CheckoutPaymentPageModule,
        SharedModule
    ],
    declarations: [
        CheckoutMainComponent,
    ],
  })
  export class CheckoutMainModule {
    static component = CheckoutMainComponent;
  }
  