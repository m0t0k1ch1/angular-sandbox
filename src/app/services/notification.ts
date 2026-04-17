import { Injectable, inject } from '@angular/core';

import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly primengMessageService = inject(MessageService);

  public success(message: string): void {
    this.primengMessageService.add({
      severity: 'success',
      summary: 'SUCCESS',
      detail: message,
      life: 3_000,
    });
  }

  public error(message: string): void {
    this.primengMessageService.add({
      severity: 'error',
      summary: 'ERROR',
      detail: message,
      life: 5_000,
    });
  }

  public unexpectedError(x: unknown): void {
    this.primengMessageService.add({
      severity: 'error',
      summary: 'UNEXPECTED ERROR',
      detail: this.stringify(x),
      life: 10_000,
    });
  }

  private stringify(x: unknown): string {
    if (typeof x === 'object' && x !== null && 'message' in x) {
      return this.stringify(x.message);
    }

    return String(x);
  }
}
