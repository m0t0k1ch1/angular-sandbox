import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { InputTextDirective, OverlayComponent, RippleDirective } from '@m0t0k1ch1/ngx';
import { isAddress, isHex, parseEther, toHex } from 'viem';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components/form-field-errors/form-field-errors';

const formSchema = z.object({
  chainID: z.string().refine((val) => z.coerce.number().int().positive().safeParse(val).success, {
    error: 'Must be a positive integer',
  }),
  toAddress: z.string().refine((val): boolean => isAddress(val), {
    error: 'Must be an Ethereum address',
  }),
  value: z
    .string()
    .refine((val) => val.length === 0 || z.coerce.number().positive().safeParse(val).success, {
      error: 'Must be a positive number or empty',
    }),
  data: z.string().refine((val) => val.length === 0 || isHex(val), {
    error: 'Must be a hex string or empty',
  }),
  ticketToken: z.jwt({
    error: 'Must be a JWT',
  }),
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  chainID: number;
  toAddress: string;
  value?: string;
  data?: string;
  ticketToken: string;
};

@Component({
  selector: 'page-send-transaction-form',
  imports: [
    FormField,
    FormRoot,
    InputTextDirective,
    OverlayComponent,
    RippleDirective,
    FormFieldErrors,
  ],
  templateUrl: './send-transaction-form.html',
  styleUrl: './send-transaction-form.css',
})
export class SendTransactionForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<FormOutput>({
    alias: 'onSubmit',
  });

  private readonly formModel = signal<FormInput>({
    chainID: '',
    toAddress: '',
    value: '',
    data: '',
    ticketToken: '',
  });

  public readonly form = form(
    this.formModel,
    (schemaPath) => {
      return validateStandardSchema(schemaPath, formSchema);
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
          this.isOverlayVisibleSignal.set(false);
          this.initForm();
        },
      },
    },
  );

  public readonly isOverlayVisibleSignal = signal(false);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form().reset({
      chainID: '',
      toAddress: '',
      value: '',
      data: '',
      ticketToken: '',
    });
  }

  public onClickOpenDialogButton(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onClickCancelButton(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
