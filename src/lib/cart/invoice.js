import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatDealLabel, getDealDivisor } from '$lib/cart/deal';

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

export const sanitizeCartItems = (items) => {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			const id = item?.id;
			const title = String(item?.title || '').trim();
			const deal = formatDealLabel(item?.deal);
			const quantity = Math.max(0, toFiniteNumber(item?.quantity, 0));
			const dealPrice = Math.max(0, toFiniteNumber(item?.price, 0));
			if (!id || !title || quantity <= 0 || dealPrice <= 0) return null;
			const divisor = getDealDivisor(deal);
			const vipUnitPrice = dealPrice / divisor;
			const vipLineTotal = vipUnitPrice * quantity;
			const hiRollerUnitPrice = dealPrice / 3;
			const hiRollerLineTotal = hiRollerUnitPrice * quantity;
			return {
				id,
				title,
				deal,
				quantity,
				dealPrice,
				vipUnitPrice,
				vipLineTotal,
				hiRollerUnitPrice,
				hiRollerLineTotal
			};
		})
		.filter(Boolean);
};

export const computeInvoiceTotal = (items) =>
	(items || []).reduce(
		(sum, item) => ({
			vip: sum.vip + Number(item?.vipLineTotal || 0),
			hiro: sum.hiro + Number(item?.hiRollerLineTotal || 0)
		}),
		{ vip: 0, hiro: 0 }
	);

export const renderInvoiceRowsHtml = (items) =>
	(items || [])
		.map(
			(item) =>
				`<tr><td>${item.id}</td><td>${item.title}</td><td>${item.deal || '-'} (${CURRENCY.format(item.dealPrice || 0)})</td><td>${item.quantity}</td><td>${CURRENCY.format(item.vipUnitPrice)}</td><td>${CURRENCY.format(item.vipLineTotal)}</td><td>${CURRENCY.format(item.hiRollerUnitPrice)}</td><td>${CURRENCY.format(item.hiRollerLineTotal)}</td></tr>`
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

const wrapTextLines = (text, { font, size, maxWidth }) => {
	const words = String(text || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (!words.length) return [''];
	const lines = [];
	let current = words[0];
	for (let i = 1; i < words.length; i += 1) {
		const candidate = `${current} ${words[i]}`;
		if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
			current = candidate;
		} else {
			lines.push(current);
			current = words[i];
		}
	}
	lines.push(current);
	return lines;
};

export const generateInvoicePdfBase64 = async ({
	orderId,
	createdAt,
	customer,
	pickupDate,
	pickupTime,
	items,
	totals
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

	let headerTextX = margin + 16;
	try {
		const logoBytes = await getLogoBytes();
		const logo = await pdfDoc.embedPng(logoBytes);
		const logoScale = 34 / logo.height;
		const logoWidth = logo.width * logoScale;
		page.drawImage(logo, {
			x: margin,
			y: 736,
			width: logoWidth,
			height: logo.height * logoScale
		});
		headerTextX = margin + logoWidth + 10;
	} catch {
		// Keep invoice generation resilient when logo is not available.
	}

	page.drawText('NORTH OF THE BORDER FIREWORKS', {
		x: headerTextX,
		y: 754,
		size: 13,
		font: fontBold,
		color: white
	});
	page.drawText('Cart Invoice', {
		x: headerTextX,
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

	y = 684;
	page.drawRectangle({ x: margin, y: y - 74, width: contentWidth, height: 78, color: soft });
	draw('Order Details', { bold: true, size: 10 });
	draw(`Created: ${new Date(createdAt).toLocaleString('en-US')}`, { size: 9 });
	draw(`Pickup: ${(pickupDate || 'Not provided') + (pickupTime ? ` ${pickupTime}` : '')}`, {
		size: 9
	});
	draw(`Customer Email: ${customer?.email || 'Not provided'}`, { size: 9 });
	draw(`Customer Phone: ${customer?.phone || 'Not provided'}`, { size: 9 });

	y -= 6;
	draw('Items', { bold: true, size: 12 });
	y -= 2;

	const columns = [
		{ key: 'id', title: 'ID', width: 35, align: 'left' },
		{ key: 'title', title: 'Item', width: 130, align: 'left' },
		{ key: 'deal', title: 'Deal', width: 90, align: 'left' },
		{ key: 'quantity', title: 'Qty', width: 25, align: 'right' },
		{ key: 'vipUnitPrice', title: 'VIP Unit', width: 60, align: 'right' },
		{ key: 'vipLineTotal', title: 'VIP Total', width: 65, align: 'right' },
		{ key: 'hiRollerUnitPrice', title: 'Hiro Unit', width: 60, align: 'right' },
		{ key: 'hiRollerLineTotal', title: 'Hiro Total', width: 65, align: 'right' }
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
			if (col.key === 'vipUnitPrice' || col.key === 'vipLineTotal') value = CURRENCY.format(value);
			if (col.key === 'hiRollerUnitPrice' || col.key === 'hiRollerLineTotal') {
				value = CURRENCY.format(value);
			}
			if (col.key === 'quantity') value = String(value);
			if (col.key === 'deal') value = `${item.deal || '-'} (${CURRENCY.format(item.dealPrice || 0)})`;
			if (col.key === 'title') value = clampText(value, 28);
			if (col.key === 'deal') value = clampText(value, 22);
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
	const vipTotalText = `VIP Pre-Tax Total: ${CURRENCY.format(totals?.vip || 0)}`;
	const hiroTotalText = `Hi-Roller Pre-Tax Total: ${CURRENCY.format(totals?.hiro || 0)}`;
	const vipTotalWidth = fontBold.widthOfTextAtSize(vipTotalText, 13);
	const hiroTotalWidth = fontBold.widthOfTextAtSize(hiroTotalText, 13);
	page.drawText(vipTotalText, {
		x: margin + contentWidth - vipTotalWidth,
		y,
		size: 13,
		font: fontBold,
		color: primary
	});
	y -= 18;
	page.drawText(hiroTotalText, {
		x: margin + contentWidth - hiroTotalWidth,
		y,
		size: 13,
		font: fontBold,
		color: primary
	});
	y -= 22;

	const legalHeader = 'Important Information';
	const legalPoints = [
		'1. All totals shown are pre-tax totals. All aerial and explosive items carry a 12% tax in addition to the regular state sales tax.',
		'2. By placing this order, you agree to pick up at the selected date and time.',
		'3. Any changes must be communicated by email or phone call.',
		'4. Payment is completed in-store at pickup.'
	];
	const legalHeaderSize = 9;
	const legalBodySize = 8;
	const legalX = margin + 8;
	const legalMaxWidth = contentWidth - 16;
	const legalHeaderLines = wrapTextLines(legalHeader, {
		font: fontBold,
		size: legalHeaderSize,
		maxWidth: legalMaxWidth
	});
	const legalPointLines = legalPoints.map((point) =>
		wrapTextLines(point, { font, size: legalBodySize, maxWidth: legalMaxWidth })
	);

	const legalLayout = [];
	let legalProbeY = y - 8;
	for (const line of legalHeaderLines) {
		legalLayout.push({ text: line, y: legalProbeY, size: legalHeaderSize, bold: true });
		legalProbeY -= legalHeaderSize + 3;
	}
	legalProbeY -= 2;
	for (const pointLines of legalPointLines) {
		for (const line of pointLines) {
			legalLayout.push({ text: line, y: legalProbeY, size: legalBodySize, bold: false });
			legalProbeY -= legalBodySize + 3;
		}
		legalProbeY -= 1;
	}
	const legalTop = y + 4;
	const legalBottom = legalProbeY - 4;
	page.drawRectangle({
		x: margin,
		y: legalBottom,
		width: contentWidth,
		height: legalTop - legalBottom,
		color: soft
	});
	for (const row of legalLayout) {
		page.drawText(row.text, {
			x: legalX,
			y: row.y,
			size: row.size,
			font: row.bold ? fontBold : font,
			color: primary
		});
	}

	const bytes = await pdfDoc.save();
	return Buffer.from(bytes).toString('base64');
};
