import { Injectable, inject } from '@angular/core';

import { MessageService } from 'primeng/api';

import { stringifyError } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private primengMessageService = inject(MessageService);

  constructor() {}

  public badRequest(err: unknown): void {
    this.primengMessageService.add({
      severity: 'error',
      summary: 'BAD REQUEST',
      detail: stringifyError(err),
      life: 5_000,
    });
  }

  public unexpectedError(err: unknown): void {
    this.primengMessageService.add({
      severity: 'error',
      summary: 'UNEXPECTED ERROR',
      detail: stringifyError(err),
      life: 5_000,
    });
  }
}
