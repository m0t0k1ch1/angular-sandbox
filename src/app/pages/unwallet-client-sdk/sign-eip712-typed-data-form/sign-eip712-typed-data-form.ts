import { Component, OnInit, input, output, signal } from '@angular/core';
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

import { z } from 'zod';

import { eip712TypedDataSchema, EIP712TypedData } from '@app/types';
import { SignEIP712TypedDataFormInput } from '@app/types/pages/unwallet-client-sdk';

type FormControlName = 'typedData' | 'ticketToken';

@Component({
  selector: 'page-sign-eip712-typed-data-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sign-eip712-typed-data-form.html',
  styleUrl: './sign-eip712-typed-data-form.css',
})
export class SignEIP712TypedDataForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<SignEIP712TypedDataFormInput>({
    alias: 'onSubmit',
  });

  public readonly form = new FormGroup<{
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
              message: 'Invalid JSON string',
              abort: true,
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
        return z.jwt().safeParse(control.value).success ? null : { valid: true };
      },
    ]),
  });

  public readonly isDialogVisibleSignal = signal(false);

  ngOnInit(): void {
    this.initFormDefaultValues();
  }

  private initFormDefaultValues(): void {
    // from https://eips.ethereum.org/assets/eip-712/Example.js
    const typedData: EIP712TypedData = {
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
    if (!this.shouldShowFormError(formControlName)) {
      return null;
    }

    const formControl = this.getFormControl(formControlName);

    if (formControl.hasError('required')) {
      return 'required';
    } else if (formControl.hasError('valid')) {
      return 'invalid';
    }

    return null;
  }

  public onClickOpenDialogButton(): void {
    this.isDialogVisibleSignal.set(true);
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.onSubmitEmitter.emit({
      typedData: eip712TypedDataSchema.parse(JSON.parse(this.getFormControl('typedData').value)),
      ticketToken: this.getFormControl('ticketToken').value,
    });

    this.isDialogVisibleSignal.set(false);

    this.initFormDefaultValues();
  }

  public onClickCancelButton(): void {
    this.isDialogVisibleSignal.set(false);
  }
}
