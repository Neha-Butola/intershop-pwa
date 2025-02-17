import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { anyNumber, anyString, anything, capture, instance, mock, spy, verify, when } from 'ts-mockito';

import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';
import { ProductsService } from 'ish-core/services/products/products.service';
import { SuggestService } from 'ish-core/services/suggest/suggest.service';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { personalizationStatusDetermined } from 'ish-core/store/customer/user';
import { loadMoreProducts, setProductListingPageSize } from 'ish-core/store/shopping/product-listing';
import { ProductListingEffects } from 'ish-core/store/shopping/product-listing/product-listing.effects';
import { ShoppingStoreModule } from 'ish-core/store/shopping/shopping-store.module';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';
import { StoreWithSnapshots, provideStoreSnapshots } from 'ish-core/utils/dev/ngrx-testing';
import { HttpStatusCodeService } from 'ish-core/utils/http-status-code/http-status-code.service';

import { searchProductsFail, suggestSearch } from './search.actions';
import { SearchEffects } from './search.effects';

describe('Search Effects', () => {
  let store$: StoreWithSnapshots;
  let effects: SearchEffects;
  let router: Router;
  let productsServiceMock: ProductsService;
  let suggestServiceMock: SuggestService;
  let httpStatusCodeService: HttpStatusCodeService;

  const suggests = [{ term: 'Goods' }] as SuggestTerm[];

  beforeEach(() => {
    suggestServiceMock = mock(SuggestService);
    when(suggestServiceMock.search(anyString())).thenReturn(of<SuggestTerm[]>(suggests));
    productsServiceMock = mock(ProductsService);
    const skus = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    when(productsServiceMock.searchProducts(anyString(), anyNumber(), anything(), anyNumber())).thenCall(
      (searchTerm: string, amount: number, _, offset: number) => {
        if (!searchTerm) {
          return throwError(() => makeHttpError({ message: 'ERROR' }));
        } else {
          const currentSlice = skus.slice(offset, amount + offset);
          return of({
            products: currentSlice.map(sku => ({ sku })),
            sortKeys: [],
            total: skus.length,
          });
        }
      }
    );

    TestBed.configureTestingModule({
      imports: [
        CoreStoreModule.forTesting(['router', 'configuration'], [SearchEffects, ProductListingEffects]),
        RouterTestingModule.withRoutes([
          { path: 'error', children: [] },
          { path: 'search/:searchTerm', children: [] },
        ]),
        ShoppingStoreModule.forTesting('productListing'),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ProductsService, useFactory: () => instance(productsServiceMock) },
        { provide: SuggestService, useFactory: () => instance(suggestServiceMock) },
        provideStoreSnapshots(),
      ],
    });

    effects = TestBed.inject(SearchEffects);
    store$ = TestBed.inject(StoreWithSnapshots);
    router = TestBed.inject(Router);
    httpStatusCodeService = spy(TestBed.inject(HttpStatusCodeService));

    store$.dispatch(setProductListingPageSize({ itemsPerPage: 12 }));
    store$.dispatch(personalizationStatusDetermined());
  });

  describe('triggerSearch$', () => {
    it('should trigger actions if search URL is matched', fakeAsync(() => {
      router.navigateByUrl('/search/dummy');

      tick(200);

      expect(store$.actionsArray(/Load More Products/)).toMatchInlineSnapshot(`
        [Product Listing] Load More Products:
          id: {"type":"search","value":"dummy"}
        [Product Listing Internal] Load More Products For Params:
          id: {"type":"search","value":"dummy"}
          filters: undefined
          sorting: undefined
          page: undefined
      `);
    }));
  });

  describe('suggestSearch$', () => {
    it('should not fire when search term is falsy', fakeAsync(() => {
      const action = suggestSearch({ searchTerm: undefined });
      store$.dispatch(action);

      tick(5000);

      verify(suggestServiceMock.search(anyString())).never();
    }));

    it('should not fire when search term is empty', fakeAsync(() => {
      const action = suggestSearch({ searchTerm: '' });
      store$.dispatch(action);

      tick(5000);

      verify(suggestServiceMock.search(anyString())).never();
    }));

    it('should return search terms when available', fakeAsync(() => {
      const action = suggestSearch({ searchTerm: 'g' });
      store$.dispatch(action);

      tick(5000);

      verify(suggestServiceMock.search('g')).once();
    }));

    it('should debounce correctly when search term is entered stepwise', fakeAsync(() => {
      store$.dispatch(suggestSearch({ searchTerm: 'g' }));
      tick(50);
      store$.dispatch(suggestSearch({ searchTerm: 'goo' }));
      tick(100);
      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(200);

      verify(suggestServiceMock.search(anyString())).never();

      tick(400);
      verify(suggestServiceMock.search('good')).once();
    }));

    it('should send only once if search term is entered multiple times', fakeAsync(() => {
      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(2000);
      verify(suggestServiceMock.search('good')).once();
      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(2000);

      verify(suggestServiceMock.search('good')).once();
    }));

    it('should not fire action when error is encountered at service level', fakeAsync(() => {
      when(suggestServiceMock.search(anyString())).thenReturn(throwError(() => makeHttpError({ message: 'ERROR' })));

      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(4000);

      effects.suggestSearch$.subscribe({ next: fail, error: fail });

      verify(suggestServiceMock.search('good')).once();
    }));

    it('should fire all necessary actions for suggest-search', fakeAsync(() => {
      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(500); // debounceTime
      expect(store$.actionsArray(/\[Suggest Search/)).toMatchInlineSnapshot(`
        [Suggest Search] Load Search Suggestions:
          searchTerm: "good"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "good"
          suggests: [{"term":"Goods"}]
      `);

      // 2nd term to because distinctUntilChanged
      store$.dispatch(suggestSearch({ searchTerm: 'goo' }));
      tick(500);
      expect(store$.actionsArray(/\[Suggest Search/)).toMatchInlineSnapshot(`
        [Suggest Search] Load Search Suggestions:
          searchTerm: "good"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "good"
          suggests: [{"term":"Goods"}]
        [Suggest Search] Load Search Suggestions:
          searchTerm: "goo"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "goo"
          suggests: [{"term":"Goods"}]
      `);

      // test cache: search->api->success & search->success->api->success
      store$.dispatch(suggestSearch({ searchTerm: 'good' }));
      tick(500);
      expect(store$.actionsArray(/\[Suggest Search/)).toMatchInlineSnapshot(`
        [Suggest Search] Load Search Suggestions:
          searchTerm: "good"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "good"
          suggests: [{"term":"Goods"}]
        [Suggest Search] Load Search Suggestions:
          searchTerm: "goo"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "goo"
          suggests: [{"term":"Goods"}]
        [Suggest Search] Load Search Suggestions:
          searchTerm: "good"
        [Suggest Search API] Return Search Suggestions:
          searchTerm: "good"
          suggests: [{"term":"Goods"}]
      `);
    }));
  });

  describe('redirectIfSearchProductFail$', () => {
    it('should redirect if triggered', fakeAsync(() => {
      store$.dispatch(searchProductsFail({ error: makeHttpError({ status: 404 }) }));

      tick(4000);

      verify(httpStatusCodeService.setStatus(anything())).once();
      expect(capture(httpStatusCodeService.setStatus).last()).toMatchInlineSnapshot(`
        [
          404,
        ]
      `);
    }));
  });

  describe('searchProducts$', () => {
    it('should perform an additional search for given search term and trigger actions', fakeAsync(() => {
      const searchTerm = '123';
      router.navigate(['search', searchTerm]);
      tick(500);

      verify(productsServiceMock.searchProducts(searchTerm, 12, anything(), 0)).once();

      store$.dispatch(loadMoreProducts({ id: { type: 'search', value: searchTerm }, page: 2 }));
      verify(productsServiceMock.searchProducts(searchTerm, 12, anything(), 12)).once();

      store$.dispatch(loadMoreProducts({ id: { type: 'search', value: searchTerm }, page: 3 }));
      verify(productsServiceMock.searchProducts(searchTerm, 12, anything(), 24)).once();
    }));
  });
});
