import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ShopsComponent } from './features/shops/shops.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
    httpTesting.expectOne('http://localhost:8080/api/shops').flush([]);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Liste des boutiques');
  });

  it('should render shop cards with images', async () => {
    const fixture = TestBed.createComponent(ShopsComponent);
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.expectOne('http://localhost:8080/api/shops').flush([
      { id: 1, name: 'Boutique Test', address: '1 rue Test', url: 'https://example.com/test.jpg' }
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cardTitle = compiled.querySelector('.card-title');
    const img = compiled.querySelector('img.card-img-top') as HTMLImageElement;
    expect(cardTitle?.textContent).toContain('Boutique Test');
    expect(img?.src).toContain('https://example.com/test.jpg');
  });
});
