import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { OverlayComponent, RippleDirective, TextInputDirective } from '@m0t0k1ch1/ngx';
import { Address, ByteArray, getAddress, isAddress, isHex, parseEther, toBytes } from 'viem';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components';

const formSchema = z.object({
  toAddress: z.string().refine((val): boolean => isAddress(val), {
    error: 'Must be an Ethereum address',
  }),
  gas: z
    .string()
    .refine((val) => val.length === 0 || z.coerce.bigint().positive().safeParse(val).success, {
      error: 'Must be a positive bigint or empty',
    }),
  gasPrice: z
    .string()
    .refine((val) => val.length === 0 || z.coerce.bigint().positive().safeParse(val).success, {
      error: 'Must be a positive bigint or empty',
    }),
  value: z
    .string()
    .refine((val) => val.length === 0 || z.coerce.number().positive().safeParse(val).success, {
      error: 'Must be a positive number or empty',
    }),
  data: z.string().refine((val) => val.length === 0 || isHex(val), {
    error: 'Must be a hex string or empty',
  }),
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  toAddress: Address;
  gas?: bigint;
  gasPrice?: bigint;
  value?: bigint;
  data?: ByteArray;
};

@Component({
  selector: 'page-send-transaction-form',
  imports: [
    FormField,
    FormRoot,
    OverlayComponent,
    RippleDirective,
    TextInputDirective,
    FormFieldErrors,
  ],
  templateUrl: './send-transaction-form.html',
  styleUrl: './send-transaction-form.css',
})
export class SendTransactionForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });
  public readonly labelSignal = input.required<string>({
    alias: 'label',
  });

  public readonly submittedEmitter = output<FormOutput>({
    alias: 'submitted',
  });

  private readonly formModel = signal<FormInput>({
    toAddress: '',
    gas: '',
    gasPrice: '',
    value: '',
    data: '',
  });

  public readonly form = form(
    this.formModel,
    (schemaPath) => {
      return validateStandardSchema(schemaPath, formSchema);
    },
    {
      submission: {
        action: async (field) => {
          const gas = field().value().gas;
          const gasPrice = field().value().gasPrice;
          const value = field().value().value;
          const data = field().value().data;

          this.submittedEmitter.emit({
            toAddress: getAddress(field().value().toAddress),
            gas: gas.length > 0 ? BigInt(gas) : undefined,
            gasPrice: gasPrice.length > 0 ? BigInt(gasPrice) : undefined,
            value: value.length > 0 ? parseEther(value) : undefined,
            data: data.length > 0 ? toBytes(data) : undefined,
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
      toAddress: '',
      gas: '',
      gasPrice: '',
      value: '',
      data: '',
    });
  }

  public onOpenDialogButtonClicked(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onCancelButtonClicked(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
