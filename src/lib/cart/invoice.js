import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const CURRENCY = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const toFiniteNumber = (value, fallback = 0) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : fallback;
};

export const getDealDivisor = (deal) => {
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

export const sanitizeCartItems = (items) => {
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

export const computeInvoiceTotal = (items) =>
	(items || []).reduce((sum, item) => sum + Number(item?.lineTotal || 0), 0);

export const renderInvoiceRowsHtml = (items) =>
	(items || [])
		.map(
			(item) =>
				`<tr><td>${item.id}</td><td>${item.title}</td><td>${item.deal || '-'}</td><td>${item.quantity}</td><td>${CURRENCY.format(item.unitPrice)}</td><td>${CURRENCY.format(item.lineTotal)}</td></tr>`
		)
		.join('');

export const generateInvoicePdfBase64 = async ({
	orderId,
	createdAt,
	customer,
	pickupDate,
	pickupTime,
	items,
	total
}) => {
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
	draw(`Email: ${customer?.email || 'Not provided'}`);
	draw(`Phone: ${customer?.phone || 'Not provided'}`);
	draw(`Pickup: ${pickupDate || 'Not provided'} ${pickupTime || ''}`.trim());
	y -= 8;
	draw('Items', { bold: true });
	draw('ID | Title | Deal | Qty | Unit | Line');
	for (const item of items || []) {
		const row = `${item.id} | ${item.title} | ${item.deal || '-'} | ${item.quantity} | ${CURRENCY.format(item.unitPrice)} | ${CURRENCY.format(item.lineTotal)}`;
		draw(row);
		if (y < 80) break;
	}
	y -= 8;
	draw(`Total: ${CURRENCY.format(total || 0)}`, { bold: true, size: 13 });
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
