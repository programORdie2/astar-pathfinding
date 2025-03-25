import type {
	AnimationRoad,
	CameFromMap,
	InfoData,
	Node,
	RoadNetwork,
} from "../types";

import { RefObject } from "react";

const heuristic = (a: Node, b: Node): number =>
	Math.hypot(a.x - b.x, a.y - b.y);

export const findPath = (
	reset: (full: boolean) => void,
	setIsRunning: (isRunning: boolean) => void,
	setInfo: (info: InfoData) => void,
	startRef: RefObject<string | null>,
	endRef: RefObject<string | null>,
	closedSetRef: RefObject<string[]>,
	path: RefObject<string[]>,
	animations: RefObject<AnimationRoad[]>,
	nodes: RoadNetwork,
	speed: number,
): void => {
	reset(false);
	setIsRunning(true);
	setInfo("");

	console.log("finding path");

	const startTime = performance.now();
	let steps = 0;

	const start = startRef.current!;
	const end = endRef.current!;
	const openSet: string[] = [start];
	const closedSet: string[] = [];
	const cameFrom: CameFromMap = {};
	const gScore: Record<string, number> = {};
	const fScore: Record<string, number> = {};

	Object.keys(nodes).forEach((node) => {
		gScore[node] = Infinity;
		fScore[node] = Infinity;
	});
	gScore[start] = 0;
	fScore[start] = heuristic(nodes[start], nodes[end]);

	const reconstructPath = (current: string): void => {
		let tempPath: string[] = [start];
		while (cameFrom[current]) {
			tempPath.push(current);
			current = cameFrom[current];
		}
		path.current = tempPath.reverse();
	};

	const step = (): void => {
		if (openSet.length === 0) return;
		steps++;
		openSet.sort((a, b) => fScore[a] - fScore[b]);
		let current = openSet.shift()!;
		closedSet.push(current);
		closedSetRef.current.push(current);

		if (current === end) {
			console.log("Found path");
			animations.current.push({
				start: nodes[cameFrom[current]],
				end: nodes[current],
				progress: 0,
				speed: 0.02,
			});
			reconstructPath(current);
			setIsRunning(false);

			setInfo([
				{ name: "Cost", value: gScore[current].toFixed(2).toString() },
				{ name: "Steps", value: steps.toString() },
				...(speed === 10
					? [
							{
								name: "Time",
								value: `${(performance.now() - startTime).toFixed(2)}ms`,
							},
					  ]
					: []),
			]);

			return;
		}

		for (let neighborId of nodes[current].neighbors) {
			if (closedSet.includes(neighborId)) continue;
			let tentative_gScore =
				gScore[current] + heuristic(nodes[current], nodes[neighborId]);
			if (tentative_gScore < gScore[neighborId]) {
				cameFrom[neighborId] = current;
				gScore[neighborId] = tentative_gScore;
				fScore[neighborId] =
					tentative_gScore + heuristic(nodes[neighborId], nodes[end]);
				if (!openSet.includes(neighborId)) {
					openSet.push(neighborId);
				}
			}
		}

		setInfo([
			{ name: "Current", value: current },
			{ name: "Cost", value: gScore[current].toFixed(2).toString() },
			{ name: "Steps", value: steps.toString() },
		]);

		const importance = Math.pow(fScore[current] + 1, -2); // Larger difference in importance
		const animationSpeed = importance * 10_000; // More pronounced speed difference for paths

		nodes[cameFrom[current]] &&
			animations.current.push({
				start: nodes[cameFrom[current]],
				end: nodes[current],
				progress: 0,
				speed: animationSpeed,
			});

		if (openSet.length === 0) {
			setIsRunning(false);
			setInfo(`No path found!`);
			return;
		}

		if (speed === 10) return step();

		setTimeout(step, 300 / speed);
	};

	step();
};
