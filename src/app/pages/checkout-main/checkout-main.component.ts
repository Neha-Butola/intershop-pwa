import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutFacade } from 'ish-core/facades/checkout.facade';
import { BasketView } from 'ish-core/models/basket/basket.model';
import { CheckoutStepType } from 'ish-core/models/checkout/checkout-step.type';

@Component({
  selector: 'ish-checkout-main',
  templateUrl: './checkout-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutMainComponent implements OnInit {
  basket: BasketView;
  nextSubmitted = false;
  private destroyRef = inject(DestroyRef);

  constructor(private checkoutFacade: CheckoutFacade) {}

  ngOnInit() {
    this.checkoutFacade.basket$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.basket = result;
    });
  }

  get nextDisabled() {
    return !this.basket?.payment && this.nextSubmitted;
  }

  goToNextStep() {
    this.nextSubmitted = true;
    this.checkoutFacade.continue(CheckoutStepType.Review);
    if (this.paymentRedirectRequired) {
      // do a hard redirect to payment redirect URL
      location.assign(this.basket.payment.redirectUrl);
    }
  }

  get paymentRedirectRequired() {
    if (this.basket.payment) {
      return (
        this.basket.payment.capabilities?.includes('RedirectBeforeCheckout') &&
        this.basket.payment.redirectUrl &&
        this.basket.payment.redirectRequired
      );
    }
  }

}
