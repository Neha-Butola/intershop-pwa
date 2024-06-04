import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ish-checkout-progress-bar',
  templateUrl: './checkout-progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProgressBarComponent {
  @Input() step = 1;

  /**
   * Define the checkout steps.
   */
  checkoutSteps = [
    {
      step: 1,
      link: '/checkout/main',
      labelKey: 'checkout.progress.checkout.label',
      stepKey: 'checkout.progress.step1.text',
    },
    {
      step: 2,
      link: '/checkout/review',
      labelKey: 'checkout.progress.review.label',
      stepKey: 'checkout.progress.step2.text',
    },
    {
      step: 3,
      link: '/checkout/receipt',
      labelKey: 'checkout.progress.receipt.label',
      stepKey: 'checkout.progress.step3.text',
    },
  ];

  /**
   * Checks whether a checkout step should be displayed as link or not.
   *
   * @param step  The checkout step to evaluate.
   * @returns     Returns 'true' if the step number is lover than the current step and if the current step is lower than 5.
   */
  checkoutStepLink(step: number): boolean {
    return step < this.step && this.step < 5;
  }
}
