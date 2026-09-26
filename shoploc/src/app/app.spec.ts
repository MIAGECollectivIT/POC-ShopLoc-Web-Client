import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { App } from './app';
import { ShopDetailComponent } from './features/shop-detail/shop-detail.component';
import { ShopsComponent } from './features/shops/shops.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(ShopsComponent);
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.expectOne('/api/shops').flush([]);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Liste des boutiques');
  });

  it('should render shop cards with images', async () => {
    const fixture = TestBed.createComponent(ShopsComponent);
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.expectOne('/api/shops').flush([
      { id: 1, name: 'Boutique Test', address: '1 rue Test', url: 'https://example.com/test.jpg' }
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cardTitle = compiled.querySelector('.card-title');
    const img = compiled.querySelector('img.card-img-top') as HTMLImageElement;
    expect(cardTitle?.textContent).toContain('Boutique Test');
    expect(img?.src).toContain('https://example.com/test.jpg');
  });

  it('should render shop detail with data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ShopDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ShopDetailComponent);
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.expectOne('/api/shops/1').flush({
      id: 1,
      name: 'Burger King Lille',
      address: '10 Rue Nationale, 59000 Lille',
      url: 'https://example.com/bk.svg',
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Burger King Lille');
    expect(compiled.querySelector('.card-text')?.textContent).toContain('10 Rue Nationale, 59000 Lille');
  });
});

