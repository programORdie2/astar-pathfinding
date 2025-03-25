export type Node = {
	id: string;
	x: number;
	y: number;
	neighbors: string[];
};

export type AnimationRoad = {
	start: { x: number; y: number; id: string };
	end: { x: number; y: number; id: string };
	speed: number;
	progress: number;
};

export type CameFromMap = Record<string, string>;
export type RoadNetwork = Record<string, Node>;

export type AnimationRoad = {
	start: { x: number; y: number; id: string };
	end: { x: number; y: number; id: string };
	speed: number;
	progress: number;
};

export type InfoData =
	| string
	| {
			name: string;
			value: string;
	  }[];
