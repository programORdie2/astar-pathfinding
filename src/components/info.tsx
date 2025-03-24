export default function Info({ name, value }: { name: string; value: string }) {
	return (
		<>
			<span className="inline-block w-10 whitespace-nowrap mr-3 text-gray-600 text-sm text-end">
				{name}
			</span>
			<b className="text-sm">{value}</b>
		</>
	);
}
