import { ErrorHandler, Injectable, Provider, inject } from '@angular/core';

import { NotificationService } from '@app/services';

@Injectable()
class AppErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(NotificationService);

  public handleError(x: unknown): void {
    if (x instanceof AggregateError) {
      for (const err of x.errors) {
        this.handleError(err);
      }
      return;
    }

    this.notificationService.unexpectedError(x);
  }
}

export const errorHandlerProvider: Provider = {
  provide: ErrorHandler,
  useClass: AppErrorHandler,
};
