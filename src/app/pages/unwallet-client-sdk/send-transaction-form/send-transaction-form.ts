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

import { parseEther, toHex } from 'viem';
import { z } from 'zod';

import { ethAddressSchema, hexSchema } from '@app/types';
import { SendTransactionFormInput } from '@app/types/pages/unwallet-client-sdk';

type FormControlName = 'chainID' | 'toAddress' | 'value' | 'data' | 'ticketToken';

@Component({
  selector: 'page-send-transaction-form',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './send-transaction-form.html',
  styleUrl: './send-transaction-form.css',
})
export class SendTransactionForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<SendTransactionFormInput>({
    alias: 'onSubmit',
  });

  public readonly form = new FormGroup<{
    [key in FormControlName]: FormControl;
  }>({
    chainID: new FormControl('', [
      Validators.required,
      (control: AbstractControl): ValidationErrors | null => {
        return z.coerce.number().int().positive().safeParse(control.value).success
          ? null
          : { valid: true };
      },
    ]),
    toAddress: new FormControl('', [
      Validators.required,
      (control: AbstractControl): ValidationErrors | null => {
        return ethAddressSchema.safeParse(control.value).success ? null : { valid: true };
      },
    ]),
    value: new FormControl('', [
      (control: AbstractControl): ValidationErrors | null => {
        return z
          .union([z.string().length(0), z.coerce.number().positive()])
          .safeParse(control.value).success
          ? null
          : { valid: true };
      },
    ]),
    data: new FormControl('', [
      (control: AbstractControl): ValidationErrors | null => {
        return z.union([z.string().length(0), hexSchema]).safeParse(control.value).success
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

  private async initFormDefaultValues(): Promise<void> {
    this.form.reset({
      chainID: '80002',
      toAddress: '',
      value: '',
      data: '',
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
      chainID: parseInt(this.getFormControl('chainID').value),
      toAddress: this.getFormControl('toAddress').value,
      value:
        this.getFormControl('value').value.length > 0
          ? toHex(parseEther(this.getFormControl('value').value))
          : undefined,
      data:
        this.getFormControl('data').value.length > 0
          ? this.getFormControl('data').value
          : undefined,
      ticketToken: this.getFormControl('ticketToken').value,
    });

    this.isDialogVisibleSignal.set(false);

    this.initFormDefaultValues();
  }

  public onClickCancelButton(): void {
    this.isDialogVisibleSignal.set(false);
  }
}
