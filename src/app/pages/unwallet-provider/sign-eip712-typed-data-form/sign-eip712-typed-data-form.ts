import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { OverlayComponent, RippleDirective, TextInputDirective } from '@m0t0k1ch1/ngx';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components';
import { sampleEIP712TypedData, eip712TypedDataSchema, EIP712TypedData } from '@app/types';

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
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  typedData: EIP712TypedData;
};

@Component({
  selector: 'page-sign-eip712-typed-data-form',
  imports: [
    FormField,
    FormRoot,
    OverlayComponent,
    RippleDirective,
    TextInputDirective,
    FormFieldErrors,
  ],
  templateUrl: './sign-eip712-typed-data-form.html',
  styleUrl: './sign-eip712-typed-data-form.css',
})
export class SignEIP712TypedDataForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });
  public readonly labelSignal = input.required<string>({
    alias: 'label',
  });

  public readonly submittedEmitter = output<FormOutput>({
    alias: 'submitted',
  });

  public readonly formModel = signal<FormInput>({
    typedData: '',
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
            typedData: eip712TypedDataSchema.parse(JSON.parse(field().value().typedData)),
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
      typedData: JSON.stringify(sampleEIP712TypedData),
    });
  }

  public onOpenDialogButtonClicked(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onCancelButtonClicked(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
