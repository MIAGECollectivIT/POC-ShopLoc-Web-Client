import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Shop } from '../models/shop.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/shops';

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl).pipe(
      map((shops) => shops.map((shop) => this.normalizeShop(shop)))
    );
  }

  getShopById(id: number | string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/${id}`).pipe(
      map((shop) => this.normalizeShop(shop))
    );
  }

  private normalizeShop(shop: Shop): Shop {
    if (shop.url && shop.url.includes('wikipedia.org/wiki/Fichier:Burger_King_logo')) {
      return {
        ...shop,
        url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Burger_King_logo_%281999%E2%80%932020%29.svg',
      };
    }
    return shop;
  }
}
