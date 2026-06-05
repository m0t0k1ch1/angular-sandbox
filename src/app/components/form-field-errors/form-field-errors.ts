import { Component, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-form-field-errors',
  imports: [],
  templateUrl: './form-field-errors.html',
  styleUrl: './form-field-errors.css',
})
export class FormFieldErrors {
  public readonly stateSignal = input.required<FieldState<unknown, string | number>>({
    alias: 'state',
  });
}
