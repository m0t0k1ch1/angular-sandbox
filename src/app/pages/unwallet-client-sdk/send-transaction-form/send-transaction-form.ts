import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { parseEther, toHex } from 'viem';

import { FormFieldErrors } from '@app/components/form-field-errors/form-field-errors';
import {
  sendTransactionFormSchema,
  SendTransactionFormInput,
  SendTransactionFormOutput,
} from '@app/types/pages/unwallet-client-sdk';

@Component({
  selector: 'page-send-transaction-form',
  imports: [FormField, FormRoot, ButtonModule, InputTextModule, DialogModule, FormFieldErrors],
  templateUrl: './send-transaction-form.html',
  styleUrl: './send-transaction-form.css',
})
export class SendTransactionForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<SendTransactionFormOutput>({
    alias: 'onSubmit',
  });

  private readonly formModel = signal<SendTransactionFormInput>({
    chainID: '',
    toAddress: '',
    value: '',
    data: '',
    ticketToken: '',
  });

  public readonly form = form(
    this.formModel,
    (schemaPath) => {
      return validateStandardSchema(schemaPath, sendTransactionFormSchema);
    },
    {
      submission: {
        action: async (field) => {
          this.onSubmitEmitter.emit({
            chainID: parseInt(field().value().chainID),
            toAddress: field().value().toAddress,
            value:
              field().value().value.length > 0
                ? toHex(parseEther(field().value().value))
                : undefined,
            data: field().value().data.length > 0 ? field().value().data : undefined,
            ticketToken: field().value().ticketToken,
          });
          this.isDialogVisibleSignal.set(false);
          this.initFormDefaultValues();
        },
      },
    },
  );

  public readonly isDialogVisibleSignal = signal(false);

  ngOnInit(): void {
    this.initFormDefaultValues();
  }

  private initFormDefaultValues(): void {
    this.form.chainID().value.set('80002');
    this.form.toAddress().value.set('');
    this.form.value().value.set('');
    this.form.data().value.set('');
    this.form.ticketToken().value.set('');
  }

  public onClickOpenDialogButton(): void {
    this.isDialogVisibleSignal.set(true);
  }

  public onClickCancelButton(): void {
    this.isDialogVisibleSignal.set(false);
  }
}
