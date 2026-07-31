import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';

import { OverlayComponent, TextInputDirective } from '@m0t0k1ch1/ngx';
import { z } from 'zod';

import { FormFieldErrors } from '@app/components';

export type FormOutput = {
  message: string;
};

const formSchema = z.object({
  message: z.string().nonempty({
    error: 'Required',
  }),
});

type FormInput = z.infer<typeof formSchema>;

@Component({
  selector: 'page-sign-form',
  imports: [FormField, FormRoot, OverlayComponent, TextInputDirective, FormFieldErrors],
  templateUrl: './sign-form.html',
  styleUrl: './sign-form.css',
})
export class SignForm implements OnInit {
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
    message: '',
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
            message: field().value().message,
          });
          this.isOverlayVisibleSignal.set(false);
        },
      },
    },
  );

  public readonly isOverlayVisibleSignal = signal<boolean>(false);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form().reset({
      message: 'message to be signed',
    });
  }

  public onOpenDialogButtonClicked(): void {
    this.isOverlayVisibleSignal.set(true);
  }

  public onCancelButtonClicked(): void {
    this.isOverlayVisibleSignal.set(false);
  }
}
