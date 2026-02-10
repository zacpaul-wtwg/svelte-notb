import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

const isEnabled = () => {
	const raw = String(env.CMS_ADMIN_ENABLED || '').trim().toLowerCase();
	if (!raw) {
		if (import.meta.env.DEV) return true;
		const context = String(env.CONTEXT || '').trim().toLowerCase();
		return context !== 'production';
	}
	return raw === 'true' || raw === '1' || raw === 'yes';
};

export function load() {
	if (!isEnabled()) {
		throw error(404, 'Not found');
	}
}
