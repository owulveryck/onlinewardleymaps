#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { renderMap } from './renderer.js';

const program = new Command();

program
  .name('owm-cli')
  .description('CLI tool to convert OWM (Online Wardley Maps) text files to SVG and PNG')
  .version('1.0.0')
  .argument('<input>', 'Path to OWM text file')
  .option('-o, --output <path>', 'Output path/directory (default: input filename)')
  .option('-f, --format <formats>', 'Output formats: svg, png, or both (default: both)', 'both')
  .option('-w, --width <pixels>', 'Map width in pixels', '1600')
  .option('-h, --height <pixels>', 'Map height in pixels', '900')
  .action(async (input, options) => {
    try {
      // Read input file
      const inputPath = resolve(input);
      console.log(`Reading OWM file: ${inputPath}`);
      const owmText = readFileSync(inputPath, 'utf-8');

      // Determine output path
      let outputPath = options.output;
      if (!outputPath) {
        const inputBase = basename(input, extname(input));
        outputPath = resolve(dirname(input), inputBase);
      } else {
        outputPath = resolve(outputPath);
      }

      // Parse format option
      const formats = options.format.toLowerCase();
      const shouldOutputSvg = formats === 'both' || formats === 'svg';
      const shouldOutputPng = formats === 'both' || formats === 'png';

      // Parse dimensions
      const width = parseInt(options.width, 10);
      const height = parseInt(options.height, 10);

      console.log(`Rendering map (${width}x${height})...`);

      // Render the map
      const { svg, pngBuffer } = await renderMap(owmText, {
        width,
        height,
        generateSvg: shouldOutputSvg,
        generatePng: shouldOutputPng,
      });

      // Write outputs
      if (shouldOutputSvg && svg) {
        const svgPath = `${outputPath}.svg`;
        writeFileSync(svgPath, svg, 'utf-8');
        console.log(`✓ SVG saved to: ${svgPath}`);
      }

      if (shouldOutputPng && pngBuffer) {
        const pngPath = `${outputPath}.png`;
        writeFileSync(pngPath, pngBuffer);
        console.log(`✓ PNG saved to: ${pngPath}`);
      }

      console.log('Done!');
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
