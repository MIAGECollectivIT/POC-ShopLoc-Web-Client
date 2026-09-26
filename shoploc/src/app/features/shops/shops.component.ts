import { Component, inject, signal } from '@angular/core';
import { Shop } from '../../core/models/shop.model';
import { ShopService } from '../../core/services/shop.service';

@Component({
  imports: [],
  selector: 'app-shops',
  templateUrl: './shops.component.html',
})
export class ShopsComponent {
  private readonly shopService = inject(ShopService);
  protected readonly shops = signal<Shop[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.shopService.getShops().subscribe({
      next: (shops) => {
        this.shops.set(shops);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Impossible de récupérer les boutiques.', error);
        this.error.set('Impossible de récupérer les données des boutiques.');
        this.loading.set(false);
      },
    });
  }
}
