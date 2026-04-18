const DRAFT_KEY = 'notb.cmsAdminDraft.v1';
const PASS_KEY = 'notb.cmsAdminPass.v1';
const DRAFT_SOURCE_KEY = 'notb.cmsAdminDraftSource.v1';

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
		window.localStorage.removeItem(DRAFT_SOURCE_KEY);
	} catch {
		// ignore
	}
}

export function loadDraftSourceFromStorage() {
	if (typeof window === 'undefined') return 'live';
	try {
		const raw = window.localStorage.getItem(DRAFT_SOURCE_KEY) || '';
		return raw === 'preview' ? 'preview' : 'live';
	} catch {
		return 'live';
	}
}

export function saveDraftSourceToStorage(source) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(DRAFT_SOURCE_KEY, source === 'preview' ? 'preview' : 'live');
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
