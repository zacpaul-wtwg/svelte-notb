import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// add from here, plus the import path from 'path'
		vite: {
			resolve: {
				alias: {
					// these are the aliases and paths to them
					$lib: path.resolve('./src/lib'),
					$stores: path.resolve('./src/stores.js'),
					$cc: path.resolve('./src/lib/comcash')
				}
			}
		}
	},

	preprocess: [
		sveltePreprocess(),
		preprocess({
			postcss: true
		}),
		mdsvex({
			extensions: ['.md']
		})
	]
};

export default config;
