import { useState, useRef, ReactNode, useEffect } from "react";
import Button from "./components/button";
import { Play, XCircle, Loader2 } from "lucide-react";
import Info from "./components/info";

type Node = {
	id: string;
	x: number;
	y: number;
	neighbors: string[];
};

type RoadNetwork = Record<string, Node>;
type CameFromMap = Record<string, string>;
type AnimationRoad = {
	start: { x: number; y: number; id: string };
	end: { x: number; y: number; id: string };
	speed: number;
	progress: number;
};

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

const heuristic = (a: Node, b: Node): number =>
	Math.hypot(a.x - b.x, a.y - b.y);

const AStarVisualizer: React.FC = () => {
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [info, setInfo] = useState<ReactNode>("Please select a start node.");
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

	useEffect(() => {
		drawNetwork();
	}, [canvasRef]);

	const DPI = window.devicePixelRatio;
	const width = (maxX + 20) * DPI;
	const height = (maxY + 20) * DPI;

	const drawNetwork = (): void => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (!hasDpiSet.current) {
			hasDpiSet.current = true;
			ctx.scale(DPI, DPI);
		}

		Object.values(NODES).forEach((node) => {
			node.neighbors.forEach((neighborId) => {
				const neighbor = NODES[neighborId];
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

			ctx.strokeStyle = "lightyellow";
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
			Object.keys(NODES).forEach((id) => {
				if (
					path.current.includes(id) &&
					!animations.current.some((a) => a.progress < 1)
				) {
					const node = NODES[id];
					node.neighbors.forEach((neighborId) => {
						if (!path.current.includes(neighborId)) return;
						const neighbor = NODES[neighborId];
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

		Object.keys(NODES).forEach((id) => {
			const node = NODES[id];

			ctx.fillStyle = "grey";
			if (closedSetRef.current.includes(id)) ctx.fillStyle = "lightyellow";
			if (path.current.includes(id)) ctx.fillStyle = "gold";

			if (id === startRef.current) ctx.fillStyle = "lightgreen";
			if (id === endRef.current) ctx.fillStyle = "pink";

			let size = 10;
			hoveredNode.current === id && (size = 12);

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

	setInterval(() => {
		if (
			!isRunningRef.current &&
			!animations.current.some((a) => a.progress < 1)
		)
			return;
		drawNetwork();
	}, 15);

	const findPath = (): void => {
		if (isRunning || !startRef.current || !endRef.current) return;

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

		Object.keys(NODES).forEach((node) => {
			gScore[node] = Infinity;
			fScore[node] = Infinity;
		});
		gScore[start] = 0;
		fScore[start] = heuristic(NODES[start], NODES[end]);

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
					start: NODES[cameFrom[current]],
					end: NODES[current],
					progress: 0,
					speed: 0.02,
				});
				reconstructPath(current);
				setIsRunning(false);
				setInfo(
					<>
						<Info name="Cost" value={gScore[current].toFixed(2).toString()} />
						<br />
						<Info name="Steps" value={steps.toString()} />
						{speed === 10 && (
							<>
								<br />
								<Info
									name="Time"
									value={`${(performance.now() - startTime).toFixed(2)}ms`}
								/>
							</>
						)}
					</>,
				);
				return;
			}

			for (let neighborId of NODES[current].neighbors) {
				if (closedSet.includes(neighborId)) continue;
				let tentative_gScore =
					gScore[current] + heuristic(NODES[current], NODES[neighborId]);
				if (tentative_gScore < gScore[neighborId]) {
					cameFrom[neighborId] = current;
					gScore[neighborId] = tentative_gScore;
					fScore[neighborId] =
						tentative_gScore + heuristic(NODES[neighborId], NODES[end]);
					if (!openSet.includes(neighborId)) {
						openSet.push(neighborId);
					}
				}
			}

			setInfo(
				<>
					<Info name="Current" value={current} />
					<br />
					<Info name="Cost" value={gScore[current].toFixed(2).toString()} />
					<br />
					<Info name="Steps" value={steps.toString()} />
				</>,
			);

			const importance = Math.pow(fScore[current] + 1, -3); // Larger difference in importance
			const animationSpeed = importance * 8_000_000; // More pronounced speed difference for paths

			NODES[cameFrom[current]] &&
				animations.current.push({
					start: NODES[cameFrom[current]],
					end: NODES[current],
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
		drawNetwork();
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
				drawNetwork();
				return;
			}
		}

		drawNetwork();
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

		drawNetwork();
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4 bg-gray-900">
			<canvas
				ref={canvasRef}
				style={{ width: maxX + 20, height: maxY + 20 }}
				width={width}
				height={height}
				onMouseMove={handleHover}
				onClick={handleClick}
			/>
			<p className="text-white">{info}</p>

			<div className="flex gap-4">
				<Button onClick={findPath} disabled={isRunning}>
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
