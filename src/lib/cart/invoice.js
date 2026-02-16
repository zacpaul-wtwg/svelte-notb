import { readFile } from 'node:fs/promises';
import path from 'node:path';
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

let logoBytesPromise;
const getLogoBytes = async () => {
	if (!logoBytesPromise) {
		const logoPath = path.resolve(process.cwd(), 'static', 'logo_large.png');
		logoBytesPromise = readFile(logoPath);
	}
	return logoBytesPromise;
};

const clampText = (value, max) => {
	const text = String(value || '').trim();
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1)}...`;
};

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
	const pageWidth = page.getWidth();
	const margin = 36;
	const contentWidth = pageWidth - margin * 2;
	const primary = rgb(0.12, 0.14, 0.18);
	const accent = rgb(0.97, 0.83, 0.11);
	const soft = rgb(0.96, 0.97, 0.98);
	const white = rgb(1, 1, 1);

	let y = 760;
	const draw = (text, { bold = false, size = 11, x = margin, color = primary } = {}) => {
		page.drawText(String(text), {
			x,
			y,
			size,
			font: bold ? fontBold : font,
			color
		});
		y -= size + 6;
	};

	page.drawRectangle({
		x: 0,
		y: 720,
		width: pageWidth,
		height: 72,
		color: primary
	});
	page.drawRectangle({
		x: 0,
		y: 716,
		width: pageWidth,
		height: 4,
		color: accent
	});

	try {
		const logoBytes = await getLogoBytes();
		const logo = await pdfDoc.embedPng(logoBytes);
		const logoScale = 34 / logo.height;
		page.drawImage(logo, {
			x: margin,
			y: 736,
			width: logo.width * logoScale,
			height: logo.height * logoScale
		});
	} catch {
		// Keep invoice generation resilient when logo is not available.
	}

	page.drawText('NORTH OF THE BORDER FIREWORKS', {
		x: margin + 72,
		y: 754,
		size: 13,
		font: fontBold,
		color: white
	});
	page.drawText('Cart Invoice', {
		x: margin + 72,
		y: 736,
		size: 11,
		font,
		color: white
	});
	page.drawText(String(orderId), {
		x: pageWidth - margin - fontBold.widthOfTextAtSize(String(orderId), 10),
		y: 754,
		size: 10,
		font: fontBold,
		color: white
	});

	y = 690;
	page.drawRectangle({ x: margin, y: y - 74, width: contentWidth, height: 78, color: soft });
	draw('Order Details', { bold: true, size: 11 });
	draw(`Created: ${new Date(createdAt).toLocaleString('en-US')}`, { size: 10 });
	draw(`Pickup: ${(pickupDate || 'Not provided') + (pickupTime ? ` ${pickupTime}` : '')}`, {
		size: 10
	});
	draw(`Customer Email: ${customer?.email || 'Not provided'}`, { size: 10 });
	draw(`Customer Phone: ${customer?.phone || 'Not provided'}`, { size: 10 });

	y -= 6;
	draw('Items', { bold: true, size: 12 });
	y -= 2;

	const columns = [
		{ key: 'id', title: 'ID', width: 58, align: 'left' },
		{ key: 'title', title: 'Item', width: 238, align: 'left' },
		{ key: 'deal', title: 'Deal', width: 66, align: 'left' },
		{ key: 'quantity', title: 'Qty', width: 44, align: 'right' },
		{ key: 'unitPrice', title: 'Unit', width: 82, align: 'right' },
		{ key: 'lineTotal', title: 'Line Total', width: 88, align: 'right' }
	];
	const rowHeight = 21;
	let rowTop = y;

	page.drawRectangle({ x: margin, y: rowTop - rowHeight, width: contentWidth, height: rowHeight, color: primary });
	let x = margin;
	for (const col of columns) {
		const titleWidth = fontBold.widthOfTextAtSize(col.title, 9);
		const titleX = col.align === 'right' ? x + col.width - titleWidth - 6 : x + 6;
		page.drawText(col.title, {
			x: titleX,
			y: rowTop - 14,
			size: 9,
			font: fontBold,
			color: white
		});
		x += col.width;
	}
	rowTop -= rowHeight;

	for (let index = 0; index < (items || []).length; index += 1) {
		const item = items[index];
		if (rowTop < 120) break;
		page.drawRectangle({
			x: margin,
			y: rowTop - rowHeight,
			width: contentWidth,
			height: rowHeight,
			color: index % 2 === 0 ? white : soft
		});
		x = margin;
		for (const col of columns) {
			let value = item[col.key] ?? '-';
			if (col.key === 'unitPrice' || col.key === 'lineTotal') value = CURRENCY.format(value);
			if (col.key === 'quantity') value = String(value);
			if (col.key === 'title') value = clampText(value, 40);
			const text = String(value);
			const textX =
				col.align === 'right' ? x + col.width - font.widthOfTextAtSize(text, 9) - 6 : x + 6;
			page.drawText(text, { x: textX, y: rowTop - 14, size: 9, font, color: primary });
			x += col.width;
		}
		rowTop -= rowHeight;
	}

	page.drawRectangle({ x: margin, y: rowTop - 1, width: contentWidth, height: 1, color: primary });
	y = rowTop - 18;
	const totalText = `Total: ${CURRENCY.format(total || 0)}`;
	const totalWidth = fontBold.widthOfTextAtSize(totalText, 15);
	page.drawText(totalText, {
		x: margin + contentWidth - totalWidth,
		y,
		size: 15,
		font: fontBold,
		color: primary
	});
	y -= 26;

	page.drawRectangle({ x: margin, y: y - 46, width: contentWidth, height: 50, color: soft });
	draw(
		'By placing this order, you agree to pick up at the selected date and time.',
		{ size: 9, x: margin + 8 }
	);
	draw('Any changes must be communicated by email or phone call.', { size: 9, x: margin + 8 });
	draw('Payment is completed in-store at pickup.', { size: 9, x: margin + 8 });

	const bytes = await pdfDoc.save();
	return Buffer.from(bytes).toString('base64');
};
