import type { RoadNetwork, AnimationRoad } from "../types";
import { RefObject } from "react";

export const drawNetwork = (
	canvasRef: RefObject<HTMLCanvasElement>,
	nodes: RoadNetwork,
	speed: number,
	hasDpiSet: RefObject<boolean>,
	animations: RefObject<AnimationRoad[]>,
	path: RefObject<string[]>,
	closedSetRef: RefObject<string[]>,
	start: string,
	end: string,
	hoveredNode: string | null,
): void => {
	const canvas = canvasRef.current;
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!hasDpiSet.current) {
		hasDpiSet.current = true;
		const DPI = window.devicePixelRatio;
		ctx.scale(DPI, DPI);
	}

	Object.values(nodes).forEach((node) => {
		node.neighbors.forEach((neighborId) => {
			const neighbor = nodes[neighborId];
			ctx.strokeStyle = "gray";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(node.x, node.y);
			ctx.lineTo(neighbor.x, neighbor.y);
			ctx.stroke();
		});
	});

	animations.current.forEach((animation) => {
		if (animation.progress < 1) {
			animation.progress += animation.speed * speed;
		}

		animation.progress = Math.min(animation.progress, 1);

		ctx.strokeStyle = "lightblue";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(animation.start.x, animation.start.y);
		ctx.lineTo(
			animation.start.x +
				(animation.end.x - animation.start.x) * animation.progress,
			animation.start.y +
				(animation.end.y - animation.start.y) * animation.progress,
		);
		ctx.stroke();
	});

	if (path.current.length > 0) {
		Object.keys(nodes).forEach((id) => {
			if (
				path.current.includes(id) &&
				!animations.current.some((a) => a.progress < 1)
			) {
				const node = nodes[id];
				node.neighbors.forEach((neighborId) => {
					if (!path.current.includes(neighborId)) return;
					const neighbor = nodes[neighborId];
					ctx.strokeStyle = "gold";
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(node.x, node.y);
					ctx.lineTo(neighbor.x, neighbor.y);
					ctx.stroke();
				});
			}
		});
	}

	Object.keys(nodes).forEach((id) => {
		const node = nodes[id];

		ctx.fillStyle = "grey";
		if (closedSetRef.current.includes(id)) ctx.fillStyle = "lightblue";
		if (path.current.includes(id)) ctx.fillStyle = "gold";

		if (id === start) ctx.fillStyle = "lightgreen";
		if (id === end) ctx.fillStyle = "pink";

		let size = 10;
		hoveredNode === id && (size = 12);

		ctx.beginPath();
		ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "black";
		ctx.stroke();

		// Draw node id
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "12px sans-serif";
		ctx.fillText(node.id, node.x, node.y);
	});
};
