# Mentor-Mentee Relationship Visualization

An interactive visualization tool that displays Bit-Byte (mentor-mentee) relationships using a network graph. This project visualizes connections between "bytes" (mentors) and "bits" (mentees) from a CSV file using [Cosmograph](https://cosmograph.app/docs/cosmograph/Introduction), a WebGL-based graph visualization library.

![Visualization Screenshot](https://i.postimg.cc/nFqgyr5V/image.png)

## Features

- **Interactive Network Graph**: Visualize complex mentor-mentee relationships in an intuitive force-directed layout
- **Node Highlighting**: Click on any node to see detailed information about that individual's relationships
- **Search Functionality**: Quickly find specific individuals within the network
- **Interactive Controls**: Adjust node size and toggle arrow visibility

## Live Demo

Access the live visualization: [https://waihankan.github.io/mentor-mentee-visualization/](https://waihankan.github.io/mentor-mentee-visualization/)

## Project Structure

This is also available in `tree.txt`.

```
.
├── index.html                 # Main HTML entry point
├── package.json               # Project dependencies
├── public
│   └── bit_byte_tree.csv      # CSV data file
├── src
│   ├── components
│   │   ├── graph.js           # Core visualization
│   │   └── graphConfig.js     # Configuration options
│   ├── main.js                # Application entry point 
│   ├── styles
│   │   └── style.css          
│   └── utils
│       └── dataProcessor.js   # data processing
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/waihankan/mentor-mentee-visualization.git
   cd mentor-mentee-visualization
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Using Your Own Data

To visualize your own mentor-mentee relationships:

1. Replace the `public/bit_byte_tree.csv` file with your own data
2. Ensure your CSV has two columns: `byte` (mentor) and `bit` (mentee)
3. Format should be: `name(email username)` in each cell


## Acknowledgments

- [Cosmograph](https://cosmograph.app/) for the visualization library.
- [Artem Shumay](https://images.app.goo.gl/w6GtdicJCG3m4nDj7) for mentoring. 