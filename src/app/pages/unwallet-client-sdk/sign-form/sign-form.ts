import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { InputTextDirective, OverlayComponent, RippleDirective } from '@m0t0k1ch1/ngx';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components/form-field-errors/form-field-errors';

const formSchema = z.object({
  message: z.string().nonempty({
    error: 'Required',
  }),
  ticketToken: z.jwt({
    error: 'Must be a JWT',
  }),
});

type FormInput = z.infer<typeof formSchema>;

export type FormOutput = {
  message: string;
  ticketToken: string;
};

@Component({
  selector: 'page-sign-form',
  imports: [
    FormField,
    FormRoot,
    InputTextDirective,
    OverlayComponent,
    RippleDirective,
    FormFieldErrors,
  ],
  templateUrl: './sign-form.html',
  styleUrl: './sign-form.css',
})
export class SignForm implements OnInit {
  public readonly isDisabledSignal = input<boolean>(false, {
    alias: 'isDisabled',
  });

  public readonly onSubmitEmitter = output<FormOutput>({
    alias: 'onSubmit',
  });

  private readonly formModel = signal<FormInput>({
    message: '',
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
          this.onSubmitEmitter.emit(field().value());
          this.isOverlayVisibleSignal.set(false);
          this.initFormDefaultValues();
        },
      },
    },
  );

  public readonly isOverlayVisibleSignal = signal(false);

  ngOnInit(): void {
    this.initFormDefaultValues();
  }

  private initFormDefaultValues(): void {
    this.form.message().value.set('message to be signed');
    this.form.ticketToken().value.set('');
  }

  public onClickOpenDialogButton(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onClickCancelButton(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
