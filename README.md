# A\* Algorithm Visualizer

This is a simple implementation of the A\* algorithm made with React and TypeScript. It is intended to be a learning tool, and is not optimized for performance.

## Overview of the Algorithm

The A\* (pronounced "A-star") algorithm is a pathfinding algorithm used to find the shortest path between two points in a weighted graph or network. It is often used in video games, GPS navigation, and other applications where finding the shortest path is important.

The algorithm works by assigning a cost to each node in the graph, and then using a heuristic function to estimate the cost of reaching the goal node from each node. The algorithm then explores the graph, starting from the start node, and expands nodes in order of their estimated cost until the goal node is reached.

## Setup Guide

1. **Clone the Repository**

   Clone the project repository to your local machine using the following command:

   ```bash
   git clone https://github.com/programordie2/astar-visualizer.git
   cd astar-visualizer
   ```

2. **Install Dependencies**

   Install the necessary dependencies by running:

   ```bash
   npm install
   ```

### Running the Project

To start the development server and run the project locally, execute:

```bash
npm run dev
```

This will start the development server, and you can view the application by navigating to `http://localhost:5173/astar-visualizer/` in your web browser.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
