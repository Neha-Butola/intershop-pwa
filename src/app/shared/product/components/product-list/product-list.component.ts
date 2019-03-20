import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Category } from 'ish-core/models/category/category.model';
import { VariationSelection } from 'ish-core/models/product-variation/variation-selection.model';
import { VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { Product } from 'ish-core/models/product/product.model';
import { ViewType } from 'ish-core/models/viewtype/viewtype.types';

/**
 * The Product List Component displays a list of products emits an event when the user scrolled to the bottom and more products have to be loaded.
 *
 * @example
 * <ish-product-list
 *               [products]="products$ | async"
 *               [category]="category$ | async"
 *               [viewType]="viewType$ | async"
 *               (loadMore)="loadMoreProducts()"
 *               (selectVariation)="variationSelected($event)"
 * ></ish-product-list>
 */
@Component({
  selector: 'ish-product-list',
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  @Input() products: Product[];
  @Input() category?: Category;
  @Input() viewType?: ViewType = 'grid';
  @Input() loadingMore: boolean;

  @Output() loadMore = new EventEmitter<void>();
  @Output() selectVariation = new EventEmitter<{ selection: VariationSelection; product: VariationProductView }>();

  variationSelected({ selection, product }: { selection: VariationSelection; product: VariationProductView }) {
    this.selectVariation.emit({ selection, product });
  }
}
