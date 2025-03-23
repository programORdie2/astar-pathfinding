import React from "react";

export default function Button({
	styles = "bg-blue-500 hover:bg-blue-600",
	children,
	...props
}: {
	styles?: string;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`text-white py-3 px-6 rounded-lg gap-2 font-semibold text-sm shadow h-9 flex items-center justify-center ${styles} transition cursor-pointer focus:outline-none focus:shadow-outline`}
			{...props}
		>
			{children}
		</button>
	);
}
