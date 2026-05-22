const imageBaseUrl = String(import.meta.env.VITE_IMAGE_BASE_URL || "")
	.trim()
	.replace(/\/+$/, "");

export function resolveImageUrl(value) {
	if (!value) return "";
	const url = String(value).trim();
	if (!url) return "";

	if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
		return url;
	}

	let normalized = url.startsWith("/") ? url : `/${url}`;
	if (normalized.startsWith("/assets/uploads/")) {
		normalized = normalized.replace("/assets/uploads/", "/uploads/");
	}

	return imageBaseUrl ? `${imageBaseUrl}${normalized}` : normalized;
}
