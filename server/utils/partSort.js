function partPriority(title) {
	const key = String(title || "").trim().toLowerCase();
	if (key === "engine" || key === "engines") return 0;
	if (key === "transmission" || key === "transmissions") return 1;
	return 2;
}

function sortPartsByPriority(parts) {
	return [...(parts || [])].sort((a, b) => {
		const pa = partPriority(a?.title);
		const pb = partPriority(b?.title);
		if (pa !== pb) return pa - pb;
		return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, { sensitivity: "base" });
	});
}

function sortManualProductsByPartPriority(products) {
	return [...(products || [])].sort((a, b) => {
		const pa = partPriority(a?.category?.title);
		const pb = partPriority(b?.category?.title);
		if (pa !== pb) return pa - pb;
		return String(a?.name || "").localeCompare(String(b?.name || ""), undefined, { sensitivity: "base" });
	});
}

module.exports = { sortPartsByPriority, sortManualProductsByPartPriority, partPriority };
