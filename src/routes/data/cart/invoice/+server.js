import { json } from '@sveltejs/kit';
import {
	computeInvoiceTotal,
	generateInvoicePdfBase64,
	sanitizeCartItems
} from '$lib/cart/invoice';

export const prerender = false;

export async function POST({ request }) {
	try {
		const payload = await request.json();
		const items = sanitizeCartItems(payload?.items);
		if (!items.length) {
			return json({ error: 'Cart is empty.' }, { status: 400 });
		}

		const now = new Date().toISOString();
		const totals = computeInvoiceTotal(items);
		const pdfBase64 = await generateInvoicePdfBase64({
			orderId: `CART-PREVIEW-${Date.now()}`,
			createdAt: now,
			customer: null,
			pickupDate: null,
			pickupTime: null,
			items,
			totals
		});
		const bytes = Buffer.from(pdfBase64, 'base64');

		return new Response(bytes, {
			status: 200,
			headers: {
				'content-type': 'application/pdf',
				'content-disposition': `attachment; filename="notb-cart-${Date.now()}.pdf"`,
				'cache-control': 'no-store'
			}
		});
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to generate invoice PDF.' },
			{ status: 500 }
		);
	}
}
