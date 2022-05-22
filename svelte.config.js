import preprocess from 'svelte-preprocess';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import path from 'path';

import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			crawl: true,
			enabled: true,
			onError: 'continue',
			default: true
		},
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
			preserve: ['ld+json'],
			postcss: true
		}),
		mdsvex({
			extensions: ['.md']
		})
	]
};

export default config;
