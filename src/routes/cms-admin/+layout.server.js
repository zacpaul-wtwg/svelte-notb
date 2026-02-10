import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

const isEnabled = () => {
	const raw = String(env.CMS_ADMIN_ENABLED || '').trim().toLowerCase();
	if (!raw) return import.meta.env.DEV;
	return raw === 'true' || raw === '1' || raw === 'yes';
};

export function load() {
	if (!isEnabled()) {
		throw error(404, 'Not found');
	}
}
