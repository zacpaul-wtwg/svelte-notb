import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { loadCmsData } from '$lib/cms/loadCmsData';
import {
	getNowInTimezone,
	parseIsoDate,
	parseTimeToMinutes,
	resolveHoursForDate
} from '$lib/cms/hours';
import {
	CURRENCY,
	computeInvoiceTotal,
	generateInvoicePdfBase64,
	renderInvoiceRowsHtml,
	sanitizeCartItems
} from '$lib/cart/invoice';

const DEFAULT_MANAGEMENT_EMAILS = [
	'thom@notbfireworks.com',
	'gwen@notbfireworks.com',
	'zac@notbfireworks.com'
];
const MANAGEMENT_EMAILS = String(env.ORDER_MANAGEMENT_EMAILS || '')
	.split(',')
	.map((value) => value.trim().toLowerCase())
	.filter(Boolean);
const RESOLVED_MANAGEMENT_EMAILS = MANAGEMENT_EMAILS.length
	? MANAGEMENT_EMAILS
	: DEFAULT_MANAGEMENT_EMAILS;

const STORE_TIMEZONE = env.STORE_TIMEZONE || 'America/New_York';
const ORDER_EMAIL_FROM = env.ORDER_EMAIL_FROM || 'no-reply@notbfireworks.com';

const addDaysToIsoDate = (isoDate, days) => {
	const base = parseIsoDate(isoDate);
	if (!base) return isoDate;
	const next = new Date(base);
	next.setUTCDate(next.getUTCDate() + days);
	return next.toISOString().slice(0, 10);
};

const htmlToPlainText = (html) =>
	String(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const buildManagementHtml = ({ orderId, customer, pickupDate, pickupTime, items, totals }) => `
<h2>New Cart Checkout Request (${orderId})</h2>
<p><strong>Customer Email:</strong> ${customer.email}</p>
<p><strong>Customer Phone:</strong> ${customer.phone}</p>
<p><strong>Requested Pickup:</strong> ${pickupDate} ${pickupTime}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
  <thead>
    <tr><th>ID</th><th>Item</th><th>Deal</th><th>Qty</th><th>VIP Unit</th><th>VIP Total</th><th>Hi-Roller Unit</th><th>Hi-Roller Total</th></tr>
  </thead>
  <tbody>${renderInvoiceRowsHtml(items)}</tbody>
</table>
<p><strong>VIP Pre-Tax Total:</strong> ${CURRENCY.format(totals.vip)}</p>
<p><strong>Hi-Roller Pre-Tax Total:</strong> ${CURRENCY.format(totals.hiro)}</p>
<p>All totals shown are pre-tax totals. All aerial and explosive items carry a 12% tax in addition to the regular state sales tax.</p>
<p>Payment is completed in-store at pickup.</p>
<p>Customer agreed to pickup at selected date/time and understands changes must be communicated by email or phone call.</p>`;

const buildCustomerHtml = ({ orderId, customer, pickupDate, pickupTime, totals }) => `
<h2>Your North of the Border Cart Request (${orderId})</h2>
<p>Thanks for submitting your cart. Management received your packing list.</p>
<p><strong>Pickup Date/Time:</strong> ${pickupDate} ${pickupTime}</p>
<p><strong>Customer Email:</strong> ${customer.email}</p>
<p><strong>Customer Phone:</strong> ${customer.phone}</p>
<p><strong>Estimated VIP Pre-Tax Total:</strong> ${CURRENCY.format(totals.vip)}</p>
<p><strong>Estimated Hi-Roller Pre-Tax Total:</strong> ${CURRENCY.format(totals.hiro)}</p>
<p>All totals shown are pre-tax totals. All aerial and explosive items carry a 12% tax in addition to the regular state sales tax.</p>
<p>Attached: your invoice PDF.</p>
<p>By placing this order, you agree to pick up at the selected date and time. Any changes must be communicated by email or phone call.</p>
<p>Payment happens in-store at pickup.</p>`;

const sendResendEmail = async ({ to, subject, html, attachments = [], replyTo }) => {
	if (!env.RESEND_API_KEY) {
		throw new Error('Missing RESEND_API_KEY');
	}
	const normalizedReplyTo = String(replyTo || '').trim();
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: ORDER_EMAIL_FROM,
			to,
			subject,
			html,
			text: htmlToPlainText(html),
			attachments,
			...(normalizedReplyTo ? { reply_to: normalizedReplyTo } : {})
		})
	});
	if (!response.ok) {
		const details = await response.text().catch(() => '');
		throw new Error(`Resend error ${response.status}: ${details}`);
	}
	return response.json();
};

export const prerender = false;

export async function POST({ request, fetch }) {
	try {
		const payload = await request.json();
		const email = String(payload?.email || '').trim().toLowerCase();
		const phone = String(payload?.phone || '').trim();
		const pickupDate = String(payload?.pickupDate || '').trim();
		const pickupTime = String(payload?.pickupTime || '').trim();
		const agreeToPickup = Boolean(payload?.agreeToPickup);
		const items = sanitizeCartItems(payload?.items);

		if (!items.length) return json({ error: 'Cart is empty.' }, { status: 400 });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ error: 'Valid email is required.' }, { status: 400 });
		}
		if (phone.replace(/\D/g, '').length < 10) {
			return json({ error: 'Valid phone number is required.' }, { status: 400 });
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
			return json({ error: 'Pickup date is required.' }, { status: 400 });
		}
		if (parseTimeToMinutes(pickupTime) === null) {
			return json({ error: 'Pickup time is required.' }, { status: 400 });
		}
		if (!agreeToPickup) {
			return json({ error: 'Pickup agreement is required.' }, { status: 400 });
		}

		const now = getNowInTimezone(STORE_TIMEZONE);
		if (pickupDate < now.date || (pickupDate === now.date && pickupTime < now.time)) {
			return json({ error: 'Pickup time must be in the future.' }, { status: 400 });
		}

		const cms = await loadCmsData(fetch);
		const maxDaysOutInput = Number(cms?.pickupSettings?.maxDaysOut);
		const maxDaysOut = Number.isFinite(maxDaysOutInput)
			? Math.max(1, Math.min(365, Math.floor(maxDaysOutInput)))
			: 30;
		const maxPickupDate = addDaysToIsoDate(now.date, maxDaysOut);
		if (pickupDate > maxPickupDate) {
			return json(
				{
					error: `Pickup date must be within ${maxDaysOut} day(s) from today.`
				},
				{ status: 400 }
			);
		}
		const { hours } = resolveHoursForDate(cms, pickupDate);
		if (!hours) {
			return json(
				{ error: 'Store hours are unavailable for the selected pickup date.' },
				{ status: 400 }
			);
		}
		if (hours.closed || !hours.open || !hours.close) {
			return json({ error: 'Store is closed for the selected pickup date.' }, { status: 400 });
		}

		const openMinutes = parseTimeToMinutes(hours.open);
		const closeMinutes = parseTimeToMinutes(hours.close);
		const pickupMinutes = parseTimeToMinutes(pickupTime);
		if (
			openMinutes === null ||
			closeMinutes === null ||
			pickupMinutes === null ||
			pickupMinutes < openMinutes ||
			pickupMinutes > closeMinutes
		) {
			return json(
				{
					error: `Pickup time must be within open hours (${hours.open} - ${hours.close}).`
				},
				{ status: 400 }
			);
		}

		const totals = computeInvoiceTotal(items);
		const orderId = `NOTB-${Date.now()}`;
		const createdAt = new Date().toISOString();
		const customer = { email, phone };

		const invoicePdfBase64 = await generateInvoicePdfBase64({
			orderId,
			createdAt,
			customer,
			pickupDate,
			pickupTime,
			items,
			totals
		});

		await sendResendEmail({
			to: RESOLVED_MANAGEMENT_EMAILS,
			subject: `New Cart Checkout ${orderId}`,
			html: buildManagementHtml({ orderId, customer, pickupDate, pickupTime, items, totals }),
			replyTo: email
		});

		await sendResendEmail({
			to: [email],
			subject: `Your North of the Border Cart Request ${orderId}`,
			html: buildCustomerHtml({ orderId, customer, pickupDate, pickupTime, totals }),
			attachments: [
				{
					filename: `${orderId}.pdf`,
					content: invoicePdfBase64,
					content_type: 'application/pdf'
				}
			]
		});

		return json({
			ok: true,
			orderId,
			totals: {
				vip: Number(totals.vip.toFixed(2)),
				hiro: Number(totals.hiro.toFixed(2))
			}
		});
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Checkout failed.' },
			{ status: 500 }
		);
	}
}
