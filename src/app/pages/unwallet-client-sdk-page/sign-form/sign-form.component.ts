import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

const VALID_FORM_CONTROL_NAMES = ['message', 'ticketToken'] as const;

type FormControlName = (typeof VALID_FORM_CONTROL_NAMES)[number];

@Component({
  selector: 'page-sign-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sign-form.component.html',
  styleUrl: './sign-form.component.css',
})
export class SignFormComponent implements OnInit {
  @Input() isDisabled: boolean = false;

  @Output() onSubmit = new EventEmitter<SignFormInput>();

  public form = new FormGroup<{
    [key in FormControlName]: FormControl;
  }>({
    message: new FormControl('', [Validators.required]),
    ticketToken: new FormControl('', [Validators.required]),
  });

  public isDialogVisible: boolean = false;

  public ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    this.initFormDefaultValues();
  }

  private async initFormDefaultValues(): Promise<void> {
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

  public getFormError(formControlName: FormControlName): string | null {
    const formControl = this.getFormControl(formControlName);

    if (formControl.hasError('required')) {
      return 'required';
    }

    return null;
  }

  public onSubmitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const message = this.getFormControl('message').value;
    const ticketToken = this.getFormControl('ticketToken').value;

    this.onSubmit.emit({
      message: message,
      ticketToken: ticketToken,
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
