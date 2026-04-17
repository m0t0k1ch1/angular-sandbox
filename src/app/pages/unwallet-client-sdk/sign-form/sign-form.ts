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

import { SignFormInput } from '@app/types/pages/unwallet-client-sdk';

type FormControlName = 'message' | 'ticketToken';

@Component({
  selector: 'page-sign-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sign-form.html',
  styleUrl: './sign-form.css',
})
export class SignForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<SignFormInput>({
    alias: 'onSubmit',
  });

  public readonly form = new FormGroup<{
    [key in FormControlName]: FormControl;
  }>({
    message: new FormControl('', [Validators.required]),
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
    this.form.reset({
      message: 'message to be signed',
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
      message: this.getFormControl('message').value,
      ticketToken: this.getFormControl('ticketToken').value,
    });

    this.isDialogVisibleSignal.set(false);

    this.initFormDefaultValues();
  }

  public onClickCancelButton(): void {
    this.isDialogVisibleSignal.set(false);
  }
}
