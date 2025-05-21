import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { z } from 'zod/v4';

import { eip712TypedDataSchema } from '../../../schemas';

import { SignEIP712TypedDataFormInput } from '../../../interfaces/pages/unwallet-client-sdk-page';

const VALID_FORM_CONTROL_NAMES = ['typedData', 'ticketToken'] as const;

type FormControlName = (typeof VALID_FORM_CONTROL_NAMES)[number];

@Component({
  selector: 'page-sign-eip712-typed-data-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sign-eip712-typed-data-form.component.html',
  styleUrl: './sign-eip712-typed-data-form.component.css',
})
export class SignEIP712TypedDataFormComponent implements OnInit {
  @Input() isDisabled: boolean = false;

  @Output() onSubmit = new EventEmitter<SignEIP712TypedDataFormInput>();

  public form = new FormGroup<{
    [key in FormControlName]: FormControl;
  }>({
    typedData: new FormControl('', [
      Validators.required,
      (control: AbstractControl): ValidationErrors | null => {
        return z
          .string()
          .refine(
            (val) => {
              try {
                JSON.parse(val);
              } catch (e) {
                return false;
              }
              return true;
            },
            {
              abort: true,
              message: 'Invalid JSON string',
            },
          )
          .transform((val) => JSON.parse(val))
          .pipe(eip712TypedDataSchema)
          .safeParse(control.value).success
          ? null
          : { valid: true };
      },
    ]),
    ticketToken: new FormControl('', [
      Validators.required,
      (control: AbstractControl): ValidationErrors | null => {
        return z.jwt().safeParse(control.value).success
          ? null
          : { valid: true };
      },
    ]),
  });

  public isDialogVisible: boolean = false;

  public ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    this.initFormDefaultValues();
  }

  private async initFormDefaultValues(): Promise<void> {
    // from https://eips.ethereum.org/assets/eip-712/Example.js
    const typedData: z.infer<typeof eip712TypedDataSchema> = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };

    this.form.reset({
      typedData: JSON.stringify(typedData),
      ticketToken: '',
    });
  }

  private getFormControl(name: FormControlName): AbstractControl {
    return this.form.get(name)!;
  }

  public shouldShowFormError(formControlName: FormControlName): boolean {
    const formControl = this.getFormControl(formControlName);

    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  public getFormErrorMessage(formControlName: FormControlName): string | null {
    const formControl = this.getFormControl(formControlName);

    if (formControl.hasError('required')) {
      return 'required';
    } else if (formControl.hasError('valid')) {
      return 'invalid';
    }

    return null;
  }

  public onSubmitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.onSubmit.emit({
      typedData: eip712TypedDataSchema.parse(
        JSON.parse(this.getFormControl('typedData').value),
      ),
      ticketToken: this.getFormControl('ticketToken').value,
    });

    this.closeDialog();
  }

  public onClickCancelButton(): void {
    this.closeDialog();
  }

  private closeDialog(): void {
    this.isDialogVisible = false;
    this.initFormDefaultValues();
  }
}
