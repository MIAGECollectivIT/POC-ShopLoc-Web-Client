import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Shop } from '../../core/models/shop.model';
import { ShopService } from '../../core/services/shop.service';

@Component({
  imports: [RouterLink],
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html',
})
export class ShopDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly shopService = inject(ShopService);

  protected readonly shop = signal<Shop | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Identifiant de boutique manquant.');
      this.loading.set(false);
      return;
    }

    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shop.set(shop);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Impossible de récupérer la boutique.', error);
        this.error.set('Impossible de récupérer les détails de la boutique.');
        this.loading.set(false);
      },
    });
  }
}
