# OWM CLI - Online Wardley Maps Command Line Tool

A command-line tool to convert OWM (Online Wardley Maps) text files to SVG and PNG formats.

## Features

- Convert OWM text files to SVG format
- Convert OWM text files to PNG format
- Support for all OWM map styles (plain, wardley, colour, dark, handwritten)
- Customizable map dimensions
- Preserves all map elements: components, anchors, links, annotations, notes, evolution

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Navigate to the CLI directory:
```bash
cd /path/to/onlinewardleymaps/frontend/cli
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. (Optional) Link globally to use `owm-cli` from anywhere:
```bash
npm link
```

## Usage

### Batch Conversion with Makefile

The easiest way to convert multiple OWM files is using the included Makefile:

```bash
# Convert all .owm files in the examples/ directory
make

# Convert to SVG only
make svg

# Convert to PNG only
make png

# Check conversion status
make status

# Clean generated files
make clean

# See all available commands
make help
```

### Basic CLI Usage

Convert an OWM file to both SVG and PNG:
```bash
node src/index.js input.txt --output my-map
```

Or if linked globally:
```bash
owm-cli input.txt --output my-map
```

### Options

```
Usage: owm-cli <input> [options]

Arguments:
  input                  Path to OWM text file (required)

Options:
  -o, --output <path>    Output path/directory (default: input filename)
  -f, --format <formats> Output formats: svg, png, or both (default: both)
  -w, --width <pixels>   Map width in pixels (default: 500)
  -h, --height <pixels>  Map height in pixels (default: 600)
  --version              Output the version number
  --help                 Display help for command
```

### Examples

**Generate both SVG and PNG:**
```bash
owm-cli my-map.txt
```

**Generate only SVG:**
```bash
owm-cli my-map.txt --format svg
```

**Generate only PNG:**
```bash
owm-cli my-map.txt --format png
```

**Custom dimensions:**
```bash
owm-cli my-map.txt --width 1920 --height 1080
```

**Specify output directory:**
```bash
owm-cli my-map.txt --output ./output/my-map
```

## OWM File Format

The OWM format is a simple text-based DSL for describing Wardley Maps. Here's an example:

```
title Tea Shop
anchor Business [0.95, 0.63]
component Cup of Tea [0.79, 0.61]
component Cup [0.73, 0.78]
component Tea [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Kettle [0.43, 0.35]
evolve Kettle->Electric Kettle 0.62
component Power [0.1, 0.7]

Business->Cup of Tea
Cup of Tea->Cup
Cup of Tea->Tea
Cup of Tea->Hot Water
Hot Water->Kettle

annotation 1 [[0.43,0.49],[0.08,0.79]] Standardising power allows Kettles to evolve faster

style wardley
```

## How It Works

The CLI tool uses Playwright to:
1. Start the Next.js development server
2. Load the Online Wardley Maps web application
3. Inject your OWM text into the editor
4. Wait for the map to render
5. Extract the SVG from the DOM
6. Capture a PNG screenshot
7. Save both files to disk

This approach ensures that the output is identical to what you would see in the web application.

## Performance Notes

- **First run**: The Next.js server takes time to compile pages (~30-60 seconds)
- **Subsequent runs**: Still requires starting the server each time (~30-60 seconds)
- For batch processing multiple files, consider keeping the server running separately

## Troubleshooting

### "Timeout waiting for Next.js server to start"
- Make sure port 3000 is not already in use
- Check that all frontend dependencies are installed (`npm install` in parent directory)

### "Could not find editor to inject OWM text"
- The web application may not have loaded properly
- Try increasing wait times in the renderer

### Empty or incorrect SVG output
- Ensure your OWM syntax is valid
- Check that the map renders correctly in the web application first

## Development

### Project Structure

```
cli/
├── bin/
│   └── owm-cli           # Executable entry point
├── src/
│   ├── index.js          # CLI argument parsing and main logic
│   ├── renderer.js       # Playwright rendering engine
│   └── render-page.html  # (Unused) Standalone HTML template
├── package.json          # Package configuration
└── README.md            # This file
```

### Running Tests

```bash
npm test
```

Or manually:
```bash
node src/index.js test-map.txt --output test-output
```

## License

MIT - Same as the parent Online Wardley Maps project

## Contributing

This CLI tool is part of the [Online Wardley Maps](https://onlinewardleymaps.com) project. Contributions are welcome!

## Links

- [Online Wardley Maps Web App](https://onlinewardleymaps.com)
- [GitHub Repository](https://github.com/damonsk/onlinewardleymaps)
- [Wardley Mapping](https://wardley maps.com)

## Future Enhancements

- [ ] Support reading OWM from stdin
- [ ] Batch processing (multiple files)
- [ ] Watch mode for development
- [ ] Custom themes/styles
- [ ] Optimize server reuse for multiple conversions
- [ ] Standalone mode without requiring Next.js server
