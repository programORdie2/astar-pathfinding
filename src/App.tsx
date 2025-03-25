import type { RoadNetwork, AnimationRoad, InfoData } from "./types";

import { useState, useRef, useEffect, RefObject } from "react";

import Button from "./components/button";
import { Play, XCircle, Loader2 } from "lucide-react";

import { findPath } from "./logic/path-finding";
import { drawNetwork } from "./logic/render";
import Info from "./components/info";

const NODES: RoadNetwork = {
	A: { id: "A", x: 50, y: 50, neighbors: ["B", "C", "D"] },
	B: { id: "B", x: 100, y: 200, neighbors: ["A", "E", "F"] },
	C: { id: "C", x: 200, y: 100, neighbors: ["A", "G", "H"] },
	D: { id: "D", x: 100, y: 300, neighbors: ["A", "I", "J"] },
	E: { id: "E", x: 250, y: 250, neighbors: ["B", "F", "K"] },
	F: { id: "F", x: 250, y: 400, neighbors: ["B", "E", "L"] },
	G: { id: "G", x: 350, y: 150, neighbors: ["C", "H", "M"] },
	H: { id: "H", x: 350, y: 250, neighbors: ["C", "G", "N"] },
	I: { id: "I", x: 100, y: 400, neighbors: ["D", "J", "O"] },
	J: { id: "J", x: 200, y: 500, neighbors: ["D", "I", "P"] },
	K: { id: "K", x: 400, y: 300, neighbors: ["E", "L", "Q"] },
	L: { id: "L", x: 400, y: 400, neighbors: ["F", "K", "R"] },
	M: { id: "M", x: 500, y: 100, neighbors: ["G", "N", "S"] },
	N: { id: "N", x: 500, y: 250, neighbors: ["G", "H", "M", "T"] },
	O: { id: "O", x: 500, y: 500, neighbors: ["I", "P", "U"] },
	P: { id: "P", x: 200, y: 600, neighbors: ["J", "O", "V"] },
	Q: { id: "Q", x: 550, y: 350, neighbors: ["K", "R", "W"] },
	R: { id: "R", x: 550, y: 450, neighbors: ["L", "Q", "X"] },
	S: { id: "S", x: 650, y: 150, neighbors: ["M", "T", "Y"] },
	T: { id: "T", x: 650, y: 300, neighbors: ["N", "S", "Z"] },
	U: { id: "U", x: 500, y: 600, neighbors: ["O", "V"] },
	V: { id: "V", x: 350, y: 600, neighbors: ["P", "U"] },
	W: { id: "W", x: 700, y: 500, neighbors: ["Q", "X"] },
	X: { id: "X", x: 700, y: 600, neighbors: ["R", "W", "Z"] },
	Y: { id: "Y", x: 800, y: 300, neighbors: ["S", "Z"] },
	Z: { id: "Z", x: 800, y: 600, neighbors: ["T", "X", "Y"] },
};

const maxX = Math.max(...Object.values(NODES).map((node) => node.x));
const maxY = Math.max(...Object.values(NODES).map((node) => node.y));

const AStarVisualizer: React.FC = () => {
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [info, setInfo] = useState<InfoData>("Please select a start node.");
	const [speed, setSpeed] = useState<number>(1);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const path = useRef<string[]>([]);
	const closedSetRef = useRef<string[]>([]);
	const animations = useRef<AnimationRoad[]>([]);
	const isRunningRef = useRef<boolean>(false);
	const hasDpiSet = useRef<boolean>(false);
	const hoveredNode = useRef<string | null>(null);

	const startRef = useRef<string | null>(null);
	const endRef = useRef<string | null>(null);

	useEffect(() => {
		// I have no idea why this is fucking necessary, but it is
		isRunningRef.current = isRunning;
	}, [isRunning]);

	const render = (): void => {
		drawNetwork(
			canvasRef as RefObject<HTMLCanvasElement>,
			NODES,
			speed,
			hasDpiSet,
			animations,
			path,
			closedSetRef,
			startRef.current!,
			endRef.current!,
			hoveredNode.current,
		);
	};

	useEffect(() => {
		if (!canvasRef.current) return;
		render();
	}, [canvasRef]);

	const DPI = window.devicePixelRatio;
	const width = (maxX + 20) * DPI;
	const height = (maxY + 20) * DPI;

	setInterval(() => {
		if (
			!isRunningRef.current &&
			!animations.current.some((a) => a.progress < 1)
		)
			return;
		render();
	}, 15);

	const handleFindPath = (): void => {
		if (isRunning || !startRef.current || !endRef.current) return;

		findPath(
			reset,
			setIsRunning,
			setInfo,
			startRef,
			endRef,
			closedSetRef,
			path,
			animations,
			NODES,
			speed,
		);
	};

	const reset = (full: boolean): void => {
		closedSetRef.current = [];
		path.current = [];
		animations.current = [];
		setInfo("");
		if (full) {
			startRef.current = null;
			endRef.current = null;
			setInfo("Please select a start node.");
		}
		setIsRunning(false);
		render();
	};

	const handleReset = (): void => {
		reset(true);
	};

	const isHovering = (
		mouseX: number,
		mouseY: number,
		x: number,
		y: number,
	): boolean => {
		const r = 10;
		return mouseX > x - r && mouseX < x + r && mouseY > y - r && mouseY < y + r;
	};

	const handleHover = (
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
	): void => {
		const mouseX = e.nativeEvent.offsetX;
		const mouseY = e.nativeEvent.offsetY;

		hoveredNode.current = null;
		for (let node of Object.values(NODES)) {
			if (isHovering(mouseX, mouseY, node.x, node.y)) {
				hoveredNode.current = node.id;
				render();
				return;
			}
		}

		render();
	};

	const handleClick = (): void => {
		if (!hoveredNode.current) return;
		if (!startRef.current) {
			startRef.current = hoveredNode.current;
			setInfo("Please select an end node.");
		} else if (!endRef.current) {
			endRef.current = hoveredNode.current;
			setInfo("Click run to start.");
		}

		render();
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4 bg-gray-900">
			<h2 className="text-white text-2xl font-bold">A* Pathfinding</h2>

			<section className="mt-2 border-t border-gray-600 pt-4">
				<p className="text-white text-lg mb-4">
					This is an implementation of the A* pathfinding algorithm in
					TypeScript and React (Not made for performance, I'll make a Go version
					later!).
					<br />
					It is based on the pseudocode provided in the{" "}
					<a
						href="https://en.wikipedia.org/wiki/A*_search_algorithm"
						className="text-blue-500 underline"
					>
						Wikipedia article
					</a>
					.
				</p>
			</section>

			<canvas
				ref={canvasRef}
				style={{ width: maxX + 20, height: maxY + 20 }}
				width={width}
				height={height}
				onMouseMove={handleHover}
				onClick={handleClick}
			/>
			{typeof info === "string" ? (
				<p className="text-white">{info}</p>
			) : (
				<div className="flex gap-4">
					{info.map((i, index) => (
						<>
							<Info key={index} name={i.name} value={i.value} />
							<br />
						</>
					))}
				</div>
			)}

			<div className="flex gap-4">
				<Button onClick={handleFindPath} disabled={isRunning}>
					{isRunning ? (
						<>
							<Loader2 className="size-5 animate-spin" />
							Running...
						</>
					) : (
						<>
							<Play className="size-5" />
							Run
						</>
					)}
				</Button>
				<Button styles="bg-gray-500 hover:bg-gray-600" onClick={handleReset}>
					<XCircle className="size-5" />
					Reset
				</Button>
			</div>
			{!isRunning && (
				<div className="border-t border-gray-600 pt-4 flex gap-4">
					<Button
						styles={`bg-gray-500 hover:bg-gray-600 ${
							speed === 1 ? "ring-4 ring-yellow-900" : ""
						}`}
						onClick={() => setSpeed(1)}
					>
						1x
					</Button>
					<Button
						styles={`bg-gray-500 hover:bg-gray-600 ${
							speed === 5 ? "ring-4 ring-yellow-900" : ""
						}`}
						onClick={() => setSpeed(5)}
					>
						5x
					</Button>
					<Button
						styles={`bg-gray-500 hover:bg-gray-600 ${
							speed === 10 ? "ring-4 ring-yellow-900" : ""
						}`}
						onClick={() => setSpeed(10)}
					>
						MAX
					</Button>
				</div>
			)}
		</div>
	);
};

export default AStarVisualizer;
