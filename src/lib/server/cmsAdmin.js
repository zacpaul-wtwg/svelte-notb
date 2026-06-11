import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const safeEqual = (a, b) => {
	if (typeof a !== 'string' || typeof b !== 'string') return false;
	if (a.length !== b.length) return false;
	let out = 0;
	for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return out === 0;
};

export const isCmsAdminEnabled = () => {
	const raw = String(env.CMS_ADMIN_ENABLED || '').trim().toLowerCase();
	if (!raw) {
		if (dev) return true;
		const context = String(env.CONTEXT || '').trim().toLowerCase();
		return context !== 'production';
	}
	return raw === 'true' || raw === '1' || raw === 'yes';
};

export const hasCmsAdminPassword = () => Boolean(String(env.CMS_ADMIN_PASSWORD || '').trim());

export const isCmsAdminPasswordValid = (password) => {
	const configured = String(env.CMS_ADMIN_PASSWORD || '');
	if (!configured) return dev;
	return safeEqual(String(password || ''), configured);
};
