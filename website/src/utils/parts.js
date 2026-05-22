export const MILEAGE_PART_PATTERN = /\b(engine|transmission)s?\b/i;

export function isMileagePricedPart(partTitle) {
	return MILEAGE_PART_PATTERN.test(String(partTitle || '').trim());
}

export function getProductTrimTitle(product) {
	return String(product?.trim?.title || product?.trimTitle || '').trim();
}

export function formatProductPrice(value) {
	if (value === null || value === undefined || value === '') return '';
	const normalized = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
	if (!Number.isFinite(normalized) || normalized <= 0) return '';
	return normalized.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function getProductMileageLabel(product) {
	const bands = Array.isArray(product?.mileageBands)
		? product.mileageBands
		: Array.isArray(product?.trim?.mileageBands)
			? product.trim.mileageBands
			: [];
	const selected = product?.selectedMileageBand || bands.find((b) => b?.selected) || bands[0];
	if (selected?.label) return String(selected.label).trim();
	if (selected?.mileage) return String(selected.mileage).trim();
	return '';
}
