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

import { SendTransactionFormInput } from '../../../interfaces/pages/unwallet-client-sdk-page';

const VALID_FORM_CONTROL_NAMES = [
  'chainID',
  'toAddress',
  'value',
  'data',
  'ticketToken',
] as const;

type FormControlName = (typeof VALID_FORM_CONTROL_NAMES)[number];

@Component({
  selector: 'page-send-transaction-form',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './send-transaction-form.component.html',
  styleUrl: './send-transaction-form.component.css',
})
export class SendTransactionFormComponent implements OnInit {
  @Input() isDisabled: boolean = false;

  @Output() onSubmit = new EventEmitter<SendTransactionFormInput>();

  public form = new FormGroup<{
    [key in FormControlName]: FormControl;
  }>({
    chainID: new FormControl('', [Validators.required]),
    toAddress: new FormControl('', [Validators.required]),
    value: new FormControl('', []),
    data: new FormControl('', []),
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
      chainID: '80002',
      toAddress: '',
      value: '0x0',
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

    this.onSubmit.emit({
      chainID: this.getFormControl('chainID').value,
      toAddress: this.getFormControl('toAddress').value,
      value: this.getFormControl('value').value,
      data: this.getFormControl('data').value,
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
