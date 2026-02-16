import { json } from '@sveltejs/kit';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { env } from '$env/dynamic/private';
import { loadCmsData } from '$lib/cms/loadCmsData';

const MANAGEMENT_EMAILS = [
	'thom@notbfireworks.com',
	'gwen@notbfireworks.com',
	'zac@notbfireworks.com'
];

const STORE_TIMEZONE = env.STORE_TIMEZONE || 'America/New_York';
const ORDER_EMAIL_FROM = env.ORDER_EMAIL_FROM || 'North of the Border <orders@notbfireworks.com>';

const CURRENCY = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toFiniteNumber = (value, fallback = 0) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : fallback;
};

const getDealDivisor = (deal) => {
	if (typeof deal === 'number' && Number.isFinite(deal) && deal > 0) return deal;
	const text = String(deal || '')
		.trim()
		.toUpperCase();
	if (text.includes('2 FOR')) return 2;
	if (text.includes('3 FOR')) return 3;
	const parsed = Number(text);
	if (Number.isFinite(parsed) && parsed > 0) return parsed;
	return 1;
};

const parseTimeToMinutes = (value) => {
	const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
};

const getNowInTimezone = (timeZone) => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(new Date());

	const get = (type) => parts.find((p) => p.type === type)?.value || '';
	return {
		date: `${get('year')}-${get('month')}-${get('day')}`,
		time: `${get('hour')}:${get('minute')}`
	};
};

const findHoursForDate = (cms, dateValue) => {
	const specialHours = Array.isArray(cms?.specialHours) ? cms.specialHours : [];
	const specialMatches = [];
	for (const occasion of specialHours) {
		const days = Array.isArray(occasion?.days) ? occasion.days : [];
		for (const day of days) {
			if (String(day?.date || '') === dateValue) {
				specialMatches.push(day);
			}
		}
	}
	if (specialMatches.length > 0) {
		return { source: 'special', hours: specialMatches[specialMatches.length - 1] };
	}

	const date = new Date(`${dateValue}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return { source: 'regular', hours: null };
	const dayKey = weekdayKeys[date.getUTCDay()];
	return { source: 'regular', hours: cms?.hours?.[dayKey] ?? null };
};

const sanitizeCart = (items) => {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			const id = item?.id;
			const title = String(item?.title || '').trim();
			const deal = String(item?.deal || '').trim();
			const quantity = Math.max(0, toFiniteNumber(item?.quantity, 0));
			const dealPrice = Math.max(0, toFiniteNumber(item?.price, 0));
			if (!id || !title || quantity <= 0 || dealPrice <= 0) return null;
			const divisor = getDealDivisor(deal);
			const unitPrice = dealPrice / divisor;
			const lineTotal = unitPrice * quantity;
			return {
				id,
				title,
				deal,
				quantity,
				dealPrice,
				unitPrice,
				lineTotal
			};
		})
		.filter(Boolean);
};

const renderItemsRows = (items) =>
	items
		.map(
			(item) =>
				`<tr><td>${item.id}</td><td>${item.title}</td><td>${item.deal || '-'}</td><td>${item.quantity}</td><td>${CURRENCY.format(item.unitPrice)}</td><td>${CURRENCY.format(item.lineTotal)}</td></tr>`
		)
		.join('');

const buildInvoiceHtml = ({ orderId, createdAt, customer, pickupDate, pickupTime, items, total }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
    h1 { margin: 0 0 8px 0; }
    .meta { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #222; padding: 8px; font-size: 12px; }
    th { background: #f1f1f1; text-align: left; }
    .total { margin-top: 12px; font-size: 16px; font-weight: 700; }
    .legal { margin-top: 20px; font-size: 12px; line-height: 1.4; }
  </style>
</head>
<body>
  <h1>North of the Border Fireworks</h1>
  <div class="meta">
    <div><strong>Invoice #:</strong> ${orderId}</div>
    <div><strong>Created:</strong> ${createdAt}</div>
    <div><strong>Email:</strong> ${customer.email}</div>
    <div><strong>Phone:</strong> ${customer.phone}</div>
    <div><strong>Pickup:</strong> ${pickupDate} ${pickupTime}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Item</th><th>Deal</th><th>Qty</th><th>Unit</th><th>Line Total</th>
      </tr>
    </thead>
    <tbody>${renderItemsRows(items)}</tbody>
  </table>
  <div class="total">Total: ${CURRENCY.format(total)}</div>
  <p class="legal">
    By placing this order, you agree to pick up at the selected date and time.
    Any changes must be communicated by email or phone call.
    Payment is completed in-store at pickup.
  </p>
</body>
</html>`;

const htmlToPlainText = (html) =>
	String(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const buildManagementHtml = ({ orderId, customer, pickupDate, pickupTime, items, total }) => `
<h2>New Cart Checkout Request (${orderId})</h2>
<p><strong>Customer Email:</strong> ${customer.email}</p>
<p><strong>Customer Phone:</strong> ${customer.phone}</p>
<p><strong>Requested Pickup:</strong> ${pickupDate} ${pickupTime}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
  <thead>
    <tr><th>ID</th><th>Item</th><th>Deal</th><th>Qty</th><th>Unit</th><th>Line Total</th></tr>
  </thead>
  <tbody>${renderItemsRows(items)}</tbody>
</table>
<p><strong>Total:</strong> ${CURRENCY.format(total)}</p>
<p>Payment is completed in-store at pickup.</p>
<p>Customer agreed to pickup at selected date/time and understands changes must be communicated by email or phone call.</p>`;

const buildCustomerHtml = ({ orderId, customer, pickupDate, pickupTime, total }) => `
<h2>Your North of the Border Cart Request (${orderId})</h2>
<p>Thanks for submitting your cart. Management received your packing list.</p>
<p><strong>Pickup Date/Time:</strong> ${pickupDate} ${pickupTime}</p>
<p><strong>Customer Email:</strong> ${customer.email}</p>
<p><strong>Customer Phone:</strong> ${customer.phone}</p>
<p><strong>Estimated Total:</strong> ${CURRENCY.format(total)}</p>
<p>Attached: your invoice PDF.</p>
<p>By placing this order, you agree to pick up at the selected date and time. Any changes must be communicated by email or phone call.</p>
<p>Payment happens in-store at pickup.</p>`;

const generateInvoicePdfBase64 = async ({ orderId, createdAt, customer, pickupDate, pickupTime, items, total }) => {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([612, 792]);
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	let y = 760;
	const draw = (text, { bold = false, size = 11 } = {}) => {
		page.drawText(String(text), {
			x: 50,
			y,
			size,
			font: bold ? fontBold : font,
			color: rgb(0.1, 0.1, 0.1)
		});
		y -= size + 6;
	};

	draw('North of the Border Fireworks', { bold: true, size: 18 });
	draw(`Invoice #: ${orderId}`, { bold: true });
	draw(`Created: ${createdAt}`);
	draw(`Email: ${customer.email}`);
	draw(`Phone: ${customer.phone}`);
	draw(`Pickup: ${pickupDate} ${pickupTime}`);
	y -= 8;
	draw('Items', { bold: true });
	draw('ID | Title | Deal | Qty | Unit | Line');
	for (const item of items) {
		const row = `${item.id} | ${item.title} | ${item.deal || '-'} | ${item.quantity} | ${CURRENCY.format(item.unitPrice)} | ${CURRENCY.format(item.lineTotal)}`;
		draw(row);
		if (y < 80) {
			break;
		}
	}
	y -= 8;
	draw(`Total: ${CURRENCY.format(total)}`, { bold: true, size: 13 });
	y -= 8;
	draw(
		'By placing this order, you agree to pick up at the selected date and time.',
		{ size: 10 }
	);
	draw('Any changes must be communicated by email or phone call.', { size: 10 });
	draw('Payment is completed in-store at pickup.', { size: 10 });

	const bytes = await pdfDoc.save();
	return Buffer.from(bytes).toString('base64');
};

const sendResendEmail = async ({ to, subject, html, attachments = [] }) => {
	if (!env.RESEND_API_KEY) {
		throw new Error('Missing RESEND_API_KEY');
	}
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
			attachments
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
		const items = sanitizeCart(payload?.items);

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
		const { hours } = findHoursForDate(cms, pickupDate);
		if (!hours || hours.closed || !hours.open || !hours.close) {
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

		const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
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
			total
		});

		await sendResendEmail({
			to: MANAGEMENT_EMAILS,
			subject: `New Cart Checkout ${orderId}`,
			html: buildManagementHtml({ orderId, customer, pickupDate, pickupTime, items, total })
		});

		await sendResendEmail({
			to: [email],
			subject: `Your North of the Border Cart Request ${orderId}`,
			html: buildCustomerHtml({ orderId, customer, pickupDate, pickupTime, total }),
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
			total: Number(total.toFixed(2))
		});
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Checkout failed.' },
			{ status: 500 }
		);
	}
}
