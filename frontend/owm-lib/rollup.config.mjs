import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

// Common plugins for all builds
const plugins = [
    resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        browser: true,
        preferBuiltins: false,
    }),
    commonjs({
        include: /node_modules/,
    }),
    typescript({
        tsconfig: './tsconfig.json',
        sourceMap: !production,
        include: ['src/**/*', '../src/**/*'],
    }),
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    }),
];

export default [
    // ESM build (modern browsers)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/owm.esm.mjs',
            format: 'es',
            sourcemap: !production,
        },
        plugins,
    },
    // ESM minified
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/owm.esm.min.mjs',
            format: 'es',
            sourcemap: false,
        },
        plugins: [...plugins, terser()],
    },
    // UMD build (for <script> tags)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/owm.umd.js',
            format: 'umd',
            name: 'owm',
            sourcemap: !production,
            globals: {},
            exports: 'named',
        },
        plugins,
    },
    // UMD minified
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/owm.umd.min.js',
            format: 'umd',
            name: 'owm',
            sourcemap: false,
            globals: {},
            exports: 'named',
        },
        plugins: [...plugins, terser()],
    },
];
