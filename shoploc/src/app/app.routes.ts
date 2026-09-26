import { Routes } from '@angular/router';
import { ShopsComponent } from './features/shops/shops.component';
import { ShopDetailComponent } from './features/shop-detail/shop-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: ShopsComponent,
  },
  {
    path: 'shops/:id',
    component: ShopDetailComponent,
  },
  {
    path: 'produits/:id',
    redirectTo: 'shops/:id',
  },
];
