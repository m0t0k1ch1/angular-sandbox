import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RippleDirective } from '@m0t0k1ch1/ngx';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRight } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-index-page',
  imports: [RippleDirective, NgIcon],
  templateUrl: './index.html',
  styleUrl: './index.css',
  viewProviders: [provideIcons({ heroChevronRight })],
})
export default class IndexPage {
  private readonly router = inject(Router);

  public onUnWalletClientSDKButtonClicked(): void {
    this.router.navigate(['/unwallet-client-sdk']);
  }

  public onUnWalletProviderButtonClicked(): void {
    this.router.navigate(['/unwallet-provider']);
  }
}
