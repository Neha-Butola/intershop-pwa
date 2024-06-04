import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutMainComponent } from './checkout-main.component';

describe('Checkout Main Component', () => {
  let component: CheckoutMainComponent;
  let fixture: ComponentFixture<CheckoutMainComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutMainComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
