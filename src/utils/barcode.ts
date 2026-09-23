import { Product } from '../types';

export function normalizeBarcode(value: string): string {
  return value.trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function findProductByBarcode(products: Product[], codeToSearch: string, excludedProductIds: string[] = []): Product | undefined {
  const query = normalizeBarcode(codeToSearch);
  if (!query) return undefined;

  const excluded = new Set((excludedProductIds || []).map((id) => normalizeBarcode(String(id))));

  return products.find((product) => {
    if (excluded.has(normalizeBarcode(String(product.product_id)))) {
      return false;
    }

    const ids = [product.product_id, product.barcode, product.product_name]
      .filter(Boolean)
      .map((value) => normalizeBarcode(String(value)));

    return ids.some((value) => value === query || value.includes(query) || query.includes(value));
  });
}
