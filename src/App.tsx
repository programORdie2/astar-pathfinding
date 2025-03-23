import { useState, useEffect, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const START: [number, number] = [0, 0];
const END: [number, number] = [GRID_SIZE - 1, GRID_SIZE - 1];

type Grid = number[][];
type Coord = [number, number];

type CameFromMap = Record<string, Coord>;

const heuristic = (a: Coord, b: Coord): number =>
	Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const AStarVisualizer: React.FC = () => {
	const [grid, setGrid] = useState<Grid>(
		Array(GRID_SIZE)
			.fill(0)
			.map(() => Array(GRID_SIZE).fill(0)),
	);
	const [path, setPath] = useState<Coord[]>([]);
	const [openSet, setOpenSet] = useState<Coord[]>([]);
	const [closedSet, setClosedSet] = useState<Coord[]>([]);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		drawGrid();
	}, [grid, path, openSet, closedSet]);

	const drawGrid = (): void => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let y = 0; y < GRID_SIZE; y++) {
			for (let x = 0; x < GRID_SIZE; x++) {
				ctx.fillStyle = grid[y][x] === 1 ? "black" : "white";
				ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
				ctx.strokeStyle = "#ddd";
				ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
			}
		}

		ctx.fillStyle = "lightblue";
		ctx.fillRect(
			START[1] * CELL_SIZE,
			START[0] * CELL_SIZE,
			CELL_SIZE,
			CELL_SIZE,
		);
		ctx.fillStyle = "red";
		ctx.fillRect(END[1] * CELL_SIZE, END[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);

		openSet.forEach(([y, x]) => {
			ctx.fillStyle = "lightgreen";
			ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
		});
		closedSet.forEach(([y, x]) => {
			ctx.fillStyle = "lightcoral";
			ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
		});
		path.forEach(([y, x]) => {
			ctx.fillStyle = "gold";
			ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
		});
	};

	const findPath = (): void => {
		let openSet: Coord[] = [START];
		let closedSet: Coord[] = [];
		let cameFrom: CameFromMap = {};
		let gScore: number[][] = Array(GRID_SIZE)
			.fill(0)
			.map(() => Array(GRID_SIZE).fill(Infinity));
		let fScore: number[][] = Array(GRID_SIZE)
			.fill(0)
			.map(() => Array(GRID_SIZE).fill(Infinity));
		gScore[START[0]][START[1]] = 0;
		fScore[START[0]][START[1]] = heuristic(START, END);

		const neighbors = ([y, x]: Coord): Coord[] =>
			[
				[y - 1, x],
				[y + 1, x],
				[y, x - 1],
				[y, x + 1],
			].filter(
				([ny, nx]) =>
					ny >= 0 &&
					nx >= 0 &&
					ny < GRID_SIZE &&
					nx < GRID_SIZE &&
					grid[ny][nx] !== 1,
			) as Coord[];

		const reconstructPath = (current: Coord): void => {
			let tempPath: Coord[] = [];
			while (cameFrom[current.toString()]) {
				tempPath.push(current);
				current = cameFrom[current.toString()];
			}
			setPath(tempPath.reverse());
		};

		const step = (): void => {
			if (openSet.length === 0) return;
			openSet.sort((a, b) => fScore[a[0]][a[1]] - fScore[b[0]][b[1]]);
			let current = openSet.shift()!;
			closedSet.push(current);
			setClosedSet([...closedSet]);

			if (current[0] === END[0] && current[1] === END[1]) {
				reconstructPath(current);
				return;
			}

			for (let neighbor of neighbors(current)) {
				if (closedSet.some((n) => n[0] === neighbor[0] && n[1] === neighbor[1]))
					continue;
				let tentative_gScore = gScore[current[0]][current[1]] + 1;
				if (tentative_gScore < gScore[neighbor[0]][neighbor[1]]) {
					cameFrom[neighbor.toString()] = current;
					gScore[neighbor[0]][neighbor[1]] = tentative_gScore;
					fScore[neighbor[0]][neighbor[1]] =
						tentative_gScore + heuristic(neighbor, END);
					if (
						!openSet.some((n) => n[0] === neighbor[0] && n[1] === neighbor[1])
					) {
						openSet.push(neighbor);
						setOpenSet([...openSet]);
					}
				}
			}
			setTimeout(step, 10);
		};

		step();
	};

	const toggleWall = (x: number, y: number) => {
		const newGrid = grid.map((row, rowIndex) =>
			row.map((cell, colIndex) =>
				rowIndex === y && colIndex === x ? 1 - cell : cell,
			),
		);
		setGrid(newGrid);
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4">
			<canvas
				ref={canvasRef}
				width={GRID_SIZE * CELL_SIZE}
				height={GRID_SIZE * CELL_SIZE}
				onClick={(e) => {
					const rect = canvasRef.current!.getBoundingClientRect();
					const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
					const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
					toggleWall(x, y);
				}}
			/>
			<button
				onClick={findPath}
				className="px-4 py-2 bg-blue-500 text-white rounded"
			>
				Find Path
			</button>
		</div>
	);
};

export default AStarVisualizer;
