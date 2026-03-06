// import { Dialog, Transition, TransitionChild, DialogPanel } from "@headlessui/react";
// import { Fragment } from "react";

// const Modal = ({ isOpen, onClose, children, dark = false, width }) => {
// 	return (
// 		<Transition show={isOpen} as={Fragment}>
// 			<Dialog as="div" className="relative z-50" onClose={onClose}>
// 				<TransitionChild
// 					as={Fragment}
// 					enter="ease-out duration-200"
// 					enterFrom="opacity-0"
// 					enterTo="opacity-100"
// 					leave="ease-in duration-100"
// 					leaveFrom="opacity-100"
// 					leaveTo="opacity-0"
// 				>
// 					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
// 				</TransitionChild>
// 				<div className="fixed inset-0 z-10 overflow-y-auto">
// 					<div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
// 						<TransitionChild
// 							as={Fragment}
// 							enter="ease-out duration-200"
// 							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
// 							enterTo="opacity-100 translate-y-0 sm:scale-100"
// 							leave="ease-in duration-100"
// 							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
// 							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
// 						>
// 							<DialogPanel
// 								className={`
// 									relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 text-left transition-all sm:my-8 p-6
// 									${dark && "dark:bg-dark-400"}
// 									${width ? width : "w-full sm:max-w-3xl"}
// 								`}
// 							>
// 								<div className="absolute right-0 top-0 pr-4 pt-4 z-10">
// 									<button
// 										type="button"
// 										className={`text-gray-400 hover:text-gray-500
// 											${dark && "dark:hover:text-white transition duration-200"}
// 										`}
// 										onClick={onClose}
// 									>
// 										<span className="sr-only">Close</span>
// 										<i className="fa fa-times me-2 text-lg"></i>
// 									</button>
// 								</div>
// 								{children}
// 							</DialogPanel>
// 						</TransitionChild>
// 					</div>
// 				</div>
// 			</Dialog>
// 		</Transition>
// 	);
// };

// export default Modal;

import { Dialog, Transition, TransitionChild, DialogPanel } from "@headlessui/react";
import { Fragment } from "react";

const Modal = ({ isOpen, onClose, children, dark = false, width }) => {
	const panelClasses = `relative transform overflow-hidden rounded-[2rem] text-left transition-all shadow-2xl sm:my-8 ${dark ? "bg-slate-800 text-white" : "bg-white"
		} ${width ? width : "w-full sm:max-w-2xl"}`;

	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>

				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />
				</TransitionChild>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<DialogPanel className={panelClasses}>
								<div className="absolute right-0 top-0 pr-6 pt-6 z-20">
									<button
										type="button"
										className="p-2 rounded-full transition-colors duration-200 focus:outline-none text-slate-400 cursor-pointer"
										onClick={onClose}
									>
										<span className="sr-only">Close</span>
										<svg
											className="w-6 h-6"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="2.5"
											stroke="currentColor"
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div className="p-8 md:p-10">
									{children}
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default Modal;