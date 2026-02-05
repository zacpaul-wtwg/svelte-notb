import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	kit: {
		adapter: adapter(),
		prerender: {
			crawl: true,
			enabled: true,
			onError: 'continue',
			default: true
		}
	},
	preprocess: [
		sveltePreprocess({
			preserve: ['ld+json'],
			postcss: true
		}),
		mdsvex({
			extensions: ['.md']
		})
	]
};

export default config;
