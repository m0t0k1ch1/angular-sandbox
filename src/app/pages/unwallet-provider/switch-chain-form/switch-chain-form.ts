import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { OverlayComponent, RippleDirective, TextInputDirective } from '@m0t0k1ch1/ngx';
import { toHex } from 'viem';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components';

const formSchema = z.object({
  chainID: z.string().refine((val) => z.coerce.number().int().positive().safeParse(val).success, {
    error: 'Must be a positive integer',
  }),
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  chainID: string;
};

@Component({
  selector: 'page-switch-chain-form',
  imports: [
    FormField,
    FormRoot,
    OverlayComponent,
    RippleDirective,
    TextInputDirective,
    FormFieldErrors,
  ],
  templateUrl: './switch-chain-form.html',
  styleUrl: './switch-chain-form.css',
})
export class SwitchChainForm implements OnInit {
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
    chainID: '',
  });

  public readonly form = form(
    this.formModel,
    (schemaPath) => {
      return validateStandardSchema(schemaPath, formSchema);
    },
    {
      submission: {
        action: async (field) => {
          this.submittedEmitter.emit({
            chainID: toHex(Number(field().value().chainID)),
          });
          this.isOverlayVisibleSignal.set(false);
          this.initForm();
        },
      },
    },
  );

  public readonly isOverlayVisibleSignal = signal(false);

  ngOnInit(): void {}

  private initForm(): void {
    this.form().reset({
      chainID: '',
    });
  }

  public onOpenDialogButtonClicked(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onCancelButtonClicked(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
