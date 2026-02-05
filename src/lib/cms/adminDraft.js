const DRAFT_KEY = 'notb.cmsAdminDraft.v1';
const PASS_KEY = 'notb.cmsAdminPass.v1';

export function loadDraftFromStorage() {
	if (typeof window === 'undefined') return null;
	try {
		const raw = window.localStorage.getItem(DRAFT_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function saveDraftToStorage(allData) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(DRAFT_KEY, JSON.stringify(allData));
	} catch {
		// ignore
	}
}

export function clearDraftStorage() {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(DRAFT_KEY);
	} catch {
		// ignore
	}
}

export function loadPasswordFromSession() {
	if (typeof window === 'undefined') return '';
	try {
		return window.sessionStorage.getItem(PASS_KEY) || '';
	} catch {
		return '';
	}
}

export function savePasswordToSession(password) {
	if (typeof window === 'undefined') return;
	try {
		window.sessionStorage.setItem(PASS_KEY, password);
	} catch {
		// ignore
	}
}

