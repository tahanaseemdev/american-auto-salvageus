export function sortPartsWithPriority(parts) {
	return [...(parts || [])].sort((a, b) => {
		const priority = (title) => {
			const key = String(title || "").trim().toLowerCase();
			if (key === "engine" || key === "engines") return 0;
			if (key === "transmission" || key === "transmissions") return 1;
			return 2;
		};
		const pa = priority(a?.title);
		const pb = priority(b?.title);
		if (pa !== pb) return pa - pb;
		return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, { sensitivity: "base" });
	});
}
