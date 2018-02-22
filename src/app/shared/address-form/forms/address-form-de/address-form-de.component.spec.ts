import { NO_ERRORS_SCHEMA } from '@angular/core/';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../components/form-controls/input/input.component';
import { SelectTitleComponent } from '../../../components/form-controls/select/select-title/select-title.component';
import { AddressFormDEComponent } from './address-form-de.component';


describe('German Address Component', () => {
  let component: AddressFormDEComponent;
  let fixture: ComponentFixture<AddressFormDEComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [AddressFormDEComponent, InputComponent, SelectTitleComponent],
      imports: [
        TranslateModule.forRoot()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(AddressFormDEComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;

        const addressForm = new FormGroup({
          countryCode: new FormControl('DE'),
          title: new FormControl(''),
          firstName: new FormControl(''),
          lastName: new FormControl(''),
          addressLine1: new FormControl(''),
          addressLine2: new FormControl(''),
          addressLine3: new FormControl(''),
          postalCode: new FormControl(''),
          city: new FormControl('')
        });
        component.addressForm = addressForm;
        component.titles = ['Mrs.'];
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
  });

  it('should throw an error if input parameter addressForm is not set', () => {
    component.addressForm = null;
    expect(function() { fixture.detectChanges(); }).toThrowError(/.*addressForm.*missing.*/);
  });

  it('should display form input fields on creation', () => {
    fixture.detectChanges();
    expect(element.querySelector('select[data-testing-id=title]')).toBeTruthy('title is rendered');
    expect(element.querySelector('input[data-testing-id=firstName]')).toBeTruthy('first name is rendered');
    expect(element.querySelector('input[data-testing-id=lastName]')).toBeTruthy('last name is rendered');
    expect(element.querySelector('input[data-testing-id=addressLine1]')).toBeTruthy('addressLine1 is rendered');
    expect(element.querySelector('input[data-testing-id=addressLine2]')).toBeTruthy('addressLine2 is rendered');
    expect(element.querySelector('input[data-testing-id=addressLine3]')).toBeTruthy('addressLine3 is rendered');
    expect(element.querySelector('input[data-testing-id=postalCode]')).toBeTruthy('postalCode is rendered');
    expect(element.querySelector('input[data-testing-id=city]')).toBeTruthy('city is rendered');
  });
});
