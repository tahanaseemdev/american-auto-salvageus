
// const ModalButton = (props) => {
// 	return (
// 		<button
// 			onClick={props.onClick}
// 			disabled={props.disabled}
// 			type={props.type}
// 			className={
// 				`flex justify-center items-center rounded-full px-4 py-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition duration-200
// 				${props.disabled && "opacity-50 cursor-default"}
// 				${props.fullWidth && "w-full"}
// 				${props.secondary && "bg-[#F8F8F8] hover:bg-[#F2F2F2] text-black border"}
// 				${props.primary && "bg-primary hover:bg-opacity-80 text-white"}
// 				${props.danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600 text-white"}
// 			`}
// 		>
// 			{props.children}
// 		</button>
// 	);
// };

// export default ModalButton;

const ModalButton = ({
	onClick,
	disabled,
	type,
	children,
	fullWidth,
	secondary,
	primary,
	danger
}) => {
	const baseStyles = "flex justify-center items-center rounded-full px-8 py-3 text-base font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-300";

	let variantStyles = "";
	if (disabled) {
		variantStyles += " opacity-50 cursor-default";
	}

	if (fullWidth) {
		variantStyles += " w-full";
	}

	if (secondary) {
		variantStyles += " bg-white hover:bg-slate-50 text-slate-500 border border-slate-200";
	} else if (primary) {
		variantStyles += " bg-[#1e6bb9] hover:bg-[#155494] text-white shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5";
	} else if (danger) {
		variantStyles += " bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600 text-white";
	}

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			type={type}
			className={`${baseStyles} ${variantStyles}`}
		>
			{children}
		</button>
	);
};

export default ModalButton;