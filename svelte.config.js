import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
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
