const imageBaseUrl = String(import.meta.env.VITE_IMAGE_BASE_URL || "").trim().replace(/\/+$/, "");

export function resolveImageUrl(value) {
	if (!value) return "";
	const url = String(value).trim();
	if (!url) return "";

	if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
		return url;
	}

	const normalized = url.startsWith("/") ? url : `/${url}`;
	return imageBaseUrl ? `${imageBaseUrl}${normalized}` : normalized;
}
