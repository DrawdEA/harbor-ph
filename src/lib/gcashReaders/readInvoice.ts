// src/lib/gcashReaders/readInvoice.ts

/**
 * @file This module provides a robust function for parsing GCash Transaction History PDFs.
 * @description This parser uses the `pdfreader` library because it reliably works in a Node.js
 * server environment, provides essential X/Y coordinate data for each character, and correctly
 * handles password-protected files.
 *
 * The core strategy is a two-step process:
 * 1. `extractDataWithCoordinates`: A low-level engine that uses `pdfreader` to convert the raw
 *    PDF buffer into a structured array of text characters with their coordinates.
 * 2. `processExtractedData`: A high-level parser that takes this structured data and uses a
 *    coordinate-based system to map the characters into meaningful transaction fields.
 */

import { PdfReader } from "pdfreader";

/**
 * Transforms raw, coordinate-based character data into structured transaction objects.
 * This function contains all the business logic specific to the GCash PDF layout.
 * It uses a multi-pass approach to correctly handle multi-line descriptions.
 *
 * @param data An object containing the pages and their content, as extracted by `extractDataWithCoordinates`.
 * @returns An object containing the transaction date range and a list of structured transactions.
 */
function processExtractedData(data: { pages: { content: any[] }[] }) {
	const preliminaryTransactions: any[] = [];
	let dateRange: string | null = null;

	const columnBoundaries = {
		date: { start: 2, end: 7 },
		description: { start: 7, end: 20 },
		reference: { start: 20, end: 25 },
		debit: { start: 26, end: 28 },
		credit: { start: 29, end: 31 },
		balance: { start: 32, end: 35 },
	};

	// --- Pass 1: The "Anchored-Y" Row Detection (The Correct & Robust Method) ---
	const rows: { y: number; items: any[] }[] = [];
	const allContent = data.pages.flatMap((page) => page.content);
	const content = allContent.sort((a, b) => a.y - b.y || a.x - b.x);

	if (content.length > 0) {
		let currentRow: any[] = [];
		let currentRowY = -1;

		// This tolerance is tight enough to separate lines but allows for
		// minor character misalignments within a single line.
		const ROW_TOLERANCE = 0.25;

		for (const item of content) {
			if (currentRow.length === 0 || Math.abs(item.y - currentRowY) > ROW_TOLERANCE) {
				// Finish the old row if it exists
				if (currentRow.length > 0) {
					rows.push({ y: currentRowY, items: currentRow.sort((a, b) => a.x - b.x) });
				}
				// Start a new row
				currentRow = [item];
				currentRowY = item.y;
			} else {
				// Add to the current row
				currentRow.push(item);
			}
		}
		// Add the very last row after the loop finishes
		if (currentRow.length > 0) {
			rows.push({ y: currentRowY, items: currentRow.sort((a, b) => a.x - b.x) });
		}
	}

	// --- Pass 2: Create preliminary transaction objects for each (now correctly formed) visual line ---
	for (const row of rows) {
		if (row.items.length === 0) continue;
		const startX = row.items[0].x;

		const fullLineText = row.items
			.map((item) => item.text)
			.join("")
			.replace(/\s/g, "")
			.toUpperCase();

		const ignoreKeywords = [
			"GCASHTRANSACTIONHISTORY",
			"STARTINGBALANCE",
			"DATEANDTIMEDESCRIPTION",
			"ENDINGBALANCE",
			"TOTALDEBIT",
			"TOTALCREDIT",
		];
		if (ignoreKeywords.some((keyword) => fullLineText.includes(keyword))) continue;

		if (fullLineText.match(/\d{4}-\d{2}-\d{2}TO\d{4}-\d{2}-\d{2}/)) {
			dateRange = row.items
				.map((i) => i.text)
				.join("")
				.replace(/(\d{4}-\d{2}-\d{2})to(\d{4}-\d{2}-\d{2})/, "$1 to $2");
			continue;
		}

		let dateStr = "",
			descriptionStr = "",
			referenceStr = "",
			debitStr = "",
			creditStr = "",
			balanceStr = "";
		for (const charItem of row.items) {
			if (charItem.x >= columnBoundaries.date.start && charItem.x < columnBoundaries.date.end)
				dateStr += charItem.text;
			else if (
				charItem.x >= columnBoundaries.description.start &&
				charItem.x < columnBoundaries.description.end
			)
				descriptionStr += charItem.text;
			else if (
				charItem.x >= columnBoundaries.reference.start &&
				charItem.x < columnBoundaries.reference.end
			)
				referenceStr += charItem.text;
			else if (
				charItem.x >= columnBoundaries.debit.start &&
				charItem.x < columnBoundaries.debit.end
			)
				debitStr += charItem.text;
			else if (
				charItem.x >= columnBoundaries.credit.start &&
				charItem.x < columnBoundaries.credit.end
			)
				creditStr += charItem.text;
			else if (
				charItem.x >= columnBoundaries.balance.start &&
				charItem.x < columnBoundaries.balance.end
			)
				balanceStr += charItem.text;
		}

		const transaction = {
			startX: startX,
			date: dateStr.trim() || null,
			description: descriptionStr.trim(),
			reference: referenceStr.trim() || null,
			debit: parseFloat(debitStr.trim().replace(/,/g, "")) || null,
			credit: parseFloat(creditStr.trim().replace(/,/g, "")) || null,
			balance: parseFloat(balanceStr.trim().replace(/,/g, "")) || null,
		};

		if (
			Object.values(transaction).some(
				(v) =>
					(v !== null && v !== "" && v !== undefined && typeof v !== "number") ||
					(typeof v === "number" && !isNaN(v)),
			)
		) {
			preliminaryTransactions.push(transaction);
		}
	}

	// --- Pass 3: The Final, Correct Merge using Start-X Logic ---
	const finalTransactions: any[] = [];
	for (const currentTx of preliminaryTransactions) {
		const isFragment = currentTx.startX >= columnBoundaries.description.start;

		if (isFragment && finalTransactions.length > 0) {
			const mainTx = finalTransactions[finalTransactions.length - 1];
			mainTx.description = `${mainTx.description} ${currentTx.description}`.trim();
			mainTx.reference = mainTx.reference || currentTx.reference;
			mainTx.debit = mainTx.debit || currentTx.debit;
			mainTx.credit = mainTx.credit || currentTx.credit;
			mainTx.balance = mainTx.balance || currentTx.balance;
		} else if (!isFragment) {
			finalTransactions.push(currentTx);
		}
	}

	// Clean up the temporary 'startX' property before returning.
	finalTransactions.forEach((tx) => delete tx.startX);

	return { dateRange, transactions: finalTransactions };
}


/**
 * Low-level PDF parsing engine. It wraps the event-based `pdfreader` library
 * in a modern Promise-based interface.
 */
async function extractDataWithCoordinates(
	pdfBuffer: Buffer,
	password: string,
): Promise<{ pages: { content: any[] }[] }> {
	return new Promise((resolve, reject) => {
		const pages: { [key: number]: any[] } = {};
		let currentPage: number | null = null;
		const reader = new PdfReader({ password });

		reader.parseBuffer(pdfBuffer, (err, item) => {
			if (err) {
				reject(err);
			} else if (!item) {
				const rawData = {
					pages: Object.keys(pages)
						.sort((a, b) => parseInt(a) - parseInt(b))
						.map((pageNum) => ({ content: pages[parseInt(pageNum)] })),
				};
				resolve(rawData);
			} else if (item.page) {
				currentPage = item.page;
			} else if (item.text && currentPage) {
				if (!pages[currentPage]) pages[currentPage] = [];
				pages[currentPage].push({ x: item.x, y: item.y, text: item.text });
			}
		});
	});
}

/**
 * The main exported function that orchestrates the entire PDF parsing pipeline.
 */
export async function parseGcashPdf(pdfBuffer: Buffer, password: string="") {
	try {
		// Step 1: Call the engine to get raw character data with coordinates.
		const rawData = await extractDataWithCoordinates(pdfBuffer, password);

		// Step 2: Pass the raw data to the high-level processor to get final results.
		console.log(JSON.stringify(processExtractedData(rawData),null,2));
		return processExtractedData(rawData);
	} catch (error: any) {
		console.error("Failed to parse PDF with pdfreader:", error);
		// Translate low-level errors into user-friendly messages.
		if (error?.message?.includes("PasswordException")) {
			throw new Error("Invalid password provided for the PDF.");
		}
		throw new Error(
			error?.message ||
				"Could not process the PDF file. It might be corrupted or in an unsupported format.",
		);
	}
}
