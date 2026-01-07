import {chromium} from 'playwright';
import {spawn} from 'child_process';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Starts the Next.js development server
 * @returns {Promise<{server: ChildProcess, port: number}>}
 */
async function startNextServer() {
    const frontendDir = join(__dirname, '../..');
    const port = 3000;

    return new Promise((resolve, reject) => {
        const server = spawn('npm', ['run', 'dev'], {
            cwd: frontendDir,
            stdio: 'pipe',
        });

        let output = '';
        let resolved = false;

        const onData = data => {
            const text = data.toString();
            output += text;

            // Show server output for debugging
            if (process.env.DEBUG) {
                console.log('[Next.js]', text.trim());
            }

            // Look for the server ready message (Next.js outputs various formats)
            if (
                !resolved &&
                (text.includes('Ready') ||
                    text.includes('ready') ||
                    text.includes(`localhost:${port}`) ||
                    text.includes('started server') ||
                    text.includes('Local:'))
            ) {
                resolved = true;
                resolve({server, port});
            }
        };

        server.stdout.on('data', onData);
        server.stderr.on('data', onData);

        server.on('error', error => {
            if (!resolved) {
                resolved = true;
                reject(new Error(`Failed to start Next.js server: ${error.message}`));
            }
        });

        server.on('exit', code => {
            if (!resolved && code !== 0) {
                resolved = true;
                reject(new Error(`Next.js server exited with code ${code}\nOutput: ${output}`));
            }
        });

        // Timeout after 90 seconds
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                reject(new Error(`Timeout waiting for Next.js server to start.\nOutput: ${output.substring(0, 500)}`));
            }
        }, 90000);
    });
}

/**
 * Renders an OWM map to SVG and/or PNG using Playwright
 * @param {string} owmText - The OWM text content
 * @param {Object} options - Rendering options
 * @param {number} options.width - Map width in pixels
 * @param {number} options.height - Map height in pixels
 * @param {boolean} options.generateSvg - Whether to generate SVG
 * @param {boolean} options.generatePng - Whether to generate PNG
 * @returns {Promise<{svg: string|null, pngBuffer: Buffer|null}>}
 */
export async function renderMap(owmText, options) {
    const {width = 1600, height = 900, generateSvg = true, generatePng = true} = options;

    let browser = null;
    let server = null;
    let svg = null;
    let pngBuffer = null;

    try {
        // Start Next.js server
        console.log('Starting Next.js server...');
        const serverInfo = await startNextServer();
        server = serverInfo.server;
        const port = serverInfo.port;

        // Launch browser early
        browser = await chromium.launch({
            headless: true,
        });

        const context = await browser.newContext({
            viewport: {width, height},
        });

        const page = await context.newPage();

        // Navigate to the app - let Next.js compile on demand
        console.log('Loading web app (first load may take time to compile)...');
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                await page.goto(`http://localhost:${port}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 90000,
                });
                break; // Success
            } catch (error) {
                retries++;
                if (retries >= maxRetries) throw error;
                console.log(`Retry ${retries}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Wait for the app to load
        await page.waitForSelector('#map', {timeout: 10000});

        // Wait for editor to be ready
        await page.waitForSelector('.ace_editor, .CodeMirror', {timeout: 10000});

        console.log('Injecting OWM text into editor...');

        // Inject the OWM text - try both Ace and CodeMirror editors
        const injected = await page.evaluate(text => {
            // Try Ace editor first
            const aceEditor = window.ace?.edit && document.querySelector('.ace_editor');
            if (aceEditor) {
                const editor = window.ace.edit(aceEditor);
                if (editor) {
                    editor.setValue(text, -1);
                    editor.clearSelection();
                    return true;
                }
            }

            // Try CodeMirror
            const codeMirrorElement = document.querySelector('.CodeMirror');
            if (codeMirrorElement && codeMirrorElement.CodeMirror) {
                codeMirrorElement.CodeMirror.setValue(text);
                codeMirrorElement.CodeMirror.refresh();
                return true;
            }

            return false;
        }, owmText);

        if (!injected) {
            throw new Error('Could not find editor to inject OWM text');
        }

        // Wait for map to render
        console.log('Waiting for map to render...');
        await page.waitForTimeout(3000);

        // Wait for SVG to be present
        await page.waitForSelector('svg', {timeout: 10000});

        // Extract SVG if requested
        if (generateSvg) {
            const svgHTML = await page.evaluate(
                ({w, h}) => {
                    // Look for the map SVG specifically - it should be inside the #map element
                    const mapDiv = document.querySelector('#map');
                    if (!mapDiv) return null;

                    const svgElement = mapDiv.querySelector('svg');
                    if (!svgElement) return null;

                    // Set explicit dimensions for 16/9 aspect ratio
                    svgElement.setAttribute('width', w);
                    svgElement.setAttribute('height', h);
                    svgElement.setAttribute('viewBox', `0 0 ${w} ${h}`);

                    // Clean up and add proper XML namespace
                    const svgText = svgElement.outerHTML
                        .replace(/&nbsp;/g, ' ')
                        .replace(/<svg([^>]*)>/, '<svg xmlns="http://www.w3.org/2000/svg"$1>');

                    return svgText;
                },
                {w: width, h: height},
            );

            if (svgHTML) {
                svg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgHTML}`;
            }
        }

        // Generate PNG if requested
        if (generatePng) {
            // Screenshot the SVG element directly for accurate framing
            const element = await page.$('#map svg');
            if (element) {
                pngBuffer = await element.screenshot({
                    type: 'png',
                    omitBackground: false,
                });
            }
        }
    } catch (error) {
        console.error('Rendering error:', error);
        throw new Error(`Failed to render map: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.kill();
        }
    }

    return {svg, pngBuffer};
}
