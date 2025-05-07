import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { SignFormInput } from '../../../interfaces/pages/unwallet-client-sdk-page';

@Component({
  selector: 'page-sign-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sign-form.component.html',
  styleUrl: './sign-form.component.css',
})
export class SignFormComponent {
  @Input() isDisabled: boolean = false;

  @Output() onSubmit = new EventEmitter<SignFormInput>();

  private readonly DEFAULT_MESSAGE: string = 'message to be signed';

  public form = new FormGroup({
    message: new FormControl<string>(this.DEFAULT_MESSAGE, [
      Validators.required,
    ]),
    ticketToken: new FormControl<string>('', [Validators.required]),
  });

  public isDialogVisible: boolean = false;

  public get messageControl(): AbstractControl {
    return this.form.get('message')!;
  }

  public get ticketTokenControl(): AbstractControl {
    return this.form.get('ticketToken')!;
  }

  public get shouldShowMessageError(): boolean {
    return (
      this.messageControl.invalid &&
      (this.messageControl.dirty || this.messageControl.touched)
    );
  }

  public get shouldShowTicketTokenError(): boolean {
    return (
      this.ticketTokenControl.invalid &&
      (this.ticketTokenControl.dirty || this.ticketTokenControl.touched)
    );
  }

  public get messageError(): string | null {
    if (this.messageControl.hasError('required')) {
      return 'required';
    }

    return null;
  }

  public get ticketTokenError(): string | null {
    if (this.ticketTokenControl.hasError('required')) {
      return 'required';
    }

    return null;
  }

  private closeDialog(): void {
    this.isDialogVisible = false;
    this.form.reset({
      message: this.DEFAULT_MESSAGE,
      ticketToken: '',
    });
  }

  public onSubmitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.onSubmit.emit({
      message: this.messageControl.value,
      ticketToken: this.ticketTokenControl.value,
    });

    this.closeDialog();
  }

  public onClickCancelButton(): void {
    this.closeDialog();
  }
}
