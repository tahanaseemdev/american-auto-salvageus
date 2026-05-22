function getImageBaseUrl() {
	const explicit = String(import.meta.env.VITE_IMAGE_BASE_URL || "").trim().replace(/\/+$/, "");
	if (explicit) return explicit;

	const apiUrl = String(import.meta.env.VITE_API_URL || "").trim();
	if (apiUrl) return apiUrl.replace(/\/v1\/?$/i, "");

	// Local dev: Vite serves website/public at /
	return "";
}

export function normalizeImagePath(value) {
	const url = String(value || "").trim();
	if (!url) return "";

	if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
		return url;
	}

	if (url.startsWith("/assets/uploads/")) {
		return url.replace("/assets/uploads/", "/uploads/");
	}

	return url.startsWith("/") ? url : `/${url}`;
}

export function resolveImageUrl(value) {
	const normalized = normalizeImagePath(value);
	if (!normalized) return "";

	if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:") || normalized.startsWith("blob:")) {
		return normalized;
	}

	const imageBaseUrl = getImageBaseUrl();
	return imageBaseUrl ? `${imageBaseUrl}${normalized}` : normalized;
}
