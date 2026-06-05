import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { z } from 'zod';

import { FormFieldErrors } from '@app/components/form-field-errors/form-field-errors';
import { eip712TypedDataSchema, EIP712TypedData } from '@app/types';

const formSchema = z.object({
  typedData: z.string().refine(
    (val) => {
      try {
        return eip712TypedDataSchema.safeParse(JSON.parse(val)).success;
      } catch (e) {
        return false;
      }
    },
    {
      error: 'Must be an EIP712 typed data',
    },
  ),
  ticketToken: z.jwt({
    error: 'Must be a JWT',
  }),
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  typedData: EIP712TypedData;
  ticketToken: string;
};

@Component({
  selector: 'page-sign-eip712-typed-data-form',
  imports: [FormField, FormRoot, ButtonModule, DialogModule, InputTextModule, FormFieldErrors],
  templateUrl: './sign-eip712-typed-data-form.html',
  styleUrl: './sign-eip712-typed-data-form.css',
})
export class SignEIP712TypedDataForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<FormOutput>({
    alias: 'onSubmit',
  });

  private readonly formModel = signal<FormInput>({
    typedData: '',
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
            typedData: eip712TypedDataSchema.parse(JSON.parse(field().value().typedData)),
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

    this.form.typedData().value.set(JSON.stringify(typedData));
    this.form.ticketToken().value.set('');
  }

  public onClickOpenDialogButton(): void {
    this.isDialogVisibleSignal.set(true);
  }

  public onClickCancelButton(): void {
    this.isDialogVisibleSignal.set(false);
  }
}
