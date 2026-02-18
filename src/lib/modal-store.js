import { writable } from 'svelte/store';

const initialState = {
	product: null,
	productLoading: false,
	productError: '',
	wishlistOpen: false,
	wishlistMode: 'list',
	compareOpen: false
};

export const modalState = writable(initialState);

export const closeGlobalProductModal = () => {
	modalState.update((state) => ({
		...state,
		product: null,
		productLoading: false,
		productError: ''
	}));
};

export const closeGlobalWishlistModal = () => {
	modalState.update((state) => ({
		...state,
		wishlistOpen: false,
		wishlistMode: 'list'
	}));
};

export const closeGlobalCompareModal = () => {
	modalState.update((state) => ({
		...state,
		compareOpen: false
	}));
};

export const closeAllGlobalModals = () => {
	modalState.set({ ...initialState });
};

export const openGlobalWishlistModal = (mode = 'list') => {
	if (typeof window === 'undefined') return;
	const resolvedMode = mode === 'checkout' ? 'checkout' : 'list';
	modalState.update((state) => ({
		...state,
		compareOpen: false,
		product: null,
		productLoading: false,
		productError: '',
		wishlistOpen: true,
		wishlistMode: resolvedMode
	}));
};

export const setGlobalWishlistMode = (mode = 'list') => {
	const resolvedMode = mode === 'checkout' ? 'checkout' : 'list';
	modalState.update((state) => ({
		...state,
		wishlistOpen: true,
		wishlistMode: resolvedMode
	}));
};

export const openGlobalCompareModal = () => {
	if (typeof window === 'undefined') return;
	modalState.update((state) => ({
		...state,
		product: null,
		productLoading: false,
		productError: '',
		wishlistOpen: false,
		compareOpen: true
	}));
};

export const openGlobalProductModal = async (productId) => {
	if (typeof window === 'undefined') return;
	if (!productId) return;
	modalState.update((state) => ({
		...state,
		compareOpen: false,
		wishlistOpen: false,
		product: null,
		productError: '',
		productLoading: true
	}));
	try {
		const response = await fetch(`/data/product/${productId}`);
		const payload = await response.json();
		if (!response.ok || !payload?.product) {
			throw new Error(payload?.error ?? 'Failed to load product details.');
		}
		modalState.update((state) => ({
			...state,
			product: payload.product,
			productLoading: false,
			productError: ''
		}));
	} catch (error) {
		modalState.update((state) => ({
			...state,
			product: null,
			productLoading: false,
			productError: error?.message ?? 'Failed to load product details.'
		}));
	}
};
