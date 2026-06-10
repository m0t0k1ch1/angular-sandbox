import { Service, inject } from '@angular/core';

import { ToastService } from '@m0t0k1ch1/ngx';

@Service()
export class NotificationService {
  private readonly ngxToastService = inject(ToastService);

  public success(message: string): void {
    this.ngxToastService.add({
      type: 'SUCCESS',
      title: 'SUCCESS',
      message: message,
      lifetime: 3_000,
    });
  }

  public error(message: string): void {
    this.ngxToastService.add({
      type: 'ERROR',
      title: 'ERROR',
      message: message,
      lifetime: 5_000,
    });
  }

  public unexpectedError(x: unknown): void {
    this.ngxToastService.add({
      type: 'ERROR',
      title: 'UNEXPECTED ERROR',
      message: this.stringify(x),
      lifetime: 10_000,
    });
  }

  private stringify(x: unknown): string {
    if (typeof x === 'object' && x !== null && 'message' in x) {
      return this.stringify(x.message);
    }

    return String(x);
  }
}
