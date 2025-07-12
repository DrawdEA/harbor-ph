import { PDFExtract } from "pdf.js-extract";
import fs from "fs";

const pdfExtract = new PDFExtract();
const options = {
	password: "", // Your password
};

const outputFilePath = "./src/lib/gcashReaders/output.json";

pdfExtract.extract(
	"./src/lib/gcashReaders/<filename>.pdf",
	options,
	(err, data) => {
		if (err) {
			return console.error(err);
		}

		const extractedData = processExtractedData(data);

		const finalOutput = {
			dateRange: extractedData.dateRange,
			transactions: extractedData.transactions,
		};

		try {
			const jsonString = JSON.stringify(finalOutput, null, 2);
			fs.writeFileSync(outputFilePath, jsonString);
			console.log(`Successfully extracted data and saved it to ${outputFilePath}`);
			if (finalOutput.dateRange) {
				console.log(`Captured Date Range: ${finalOutput.dateRange}`);
			}
		} catch (error) {
			console.error("Error writing JSON to file:", error);
		}
	},
);

function processExtractedData(data) {
	const preliminaryTransactions = [];
	let dateRange = null;

	const columnBoundaries = {
		date: { start: 50, end: 120 },
		description: { start: 120, end: 320 },
		reference: { start: 320, end: 376 },
		debit: { start: 376, end: 442 },
		credit: { start: 442, end: 498 },
		balance: { start: 498, end: 600 },
	};

	for (const page of data.pages) {
		// --- ROW DETECTION LOGIC ---
		const content = page.content.sort((a, b) => a.y - b.y || a.x - b.x);
		const rows = [];
		let currentRow = [];
		let lastY = -1;
		const ROW_TOLERANCE = 5; // A vertical gap of more than 5px starts a new row.

		for (const item of content) {
			if (item.str.trim() === "") continue;

			if (lastY === -1 || Math.abs(item.y - lastY) > ROW_TOLERANCE) {
				if (currentRow.length > 0) {
					rows.push(currentRow.sort((a, b) => a.x - b.x)); // Sort items in the completed row by x-pos
				}
				currentRow = [item];
			} else {
				currentRow.push(item);
			}
			lastY = item.y;
		}
		if (currentRow.length > 0) {
			rows.push(currentRow.sort((a, b) => a.x - b.x));
		}
		// --- END OF ROW DETECTION LOGIC ---

		// --- PASS 1: PARSING THE CORRECTLY FORMED ROWS ---
		for (const rowItems of rows) {
			const rowText = rowItems
				.map((item) => item.str)
				.join("")
				.trim();

			if (rowText.includes("GCash Transaction History") || rowText.includes("STARTING BALANCE"))
				continue;
			if (rowText.match(/\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}/)) {
				dateRange = rowText;
				continue;
			}
			if (rowText.includes("Date and Time") && rowText.includes("Description")) continue;
			if (
				rowText.includes("ENDING BALANCE") ||
				rowText.includes("Total Debit") ||
				rowText.includes("Total Credit")
			)
				continue;

			const transaction = {
				date: null,
				description: "",
				reference: null,
				debit: null,
				credit: null,
				balance: null,
			};

			for (const item of rowItems) {
				if (item.x >= columnBoundaries.date.start && item.x < columnBoundaries.date.end) {
					transaction.date = (transaction.date || "") + item.str.trim();
				} else if (
					item.x >= columnBoundaries.description.start &&
					item.x < columnBoundaries.description.end
				) {
					transaction.description = (transaction.description || "") + item.str + " ";
				} else if (
					item.x >= columnBoundaries.reference.start &&
					item.x < columnBoundaries.reference.end
				) {
					transaction.reference = (transaction.reference || "") + item.str.trim();
				} else if (item.x >= columnBoundaries.debit.start && item.x < columnBoundaries.debit.end) {
					transaction.debit = parseFloat(item.str.trim().replace(/,/g, "")) || null;
				} else if (
					item.x >= columnBoundaries.credit.start &&
					item.x < columnBoundaries.credit.end
				) {
					transaction.credit = parseFloat(item.str.trim().replace(/,/g, "")) || null;
				} else if (
					item.x >= columnBoundaries.balance.start &&
					item.x < columnBoundaries.balance.end
				) {
					transaction.balance = parseFloat(item.str.trim().replace(/,/g, "")) || null;
				}
			}

			transaction.description = transaction.description.trim();

			if (transaction.description || transaction.date || transaction.balance !== null) {
				preliminaryTransactions.push(transaction);
			}
		}
	}

	// --- PASS 2: FORWARD-PASS MERGE ALGORITHM (This will now work correctly) ---
	const finalTransactions = [];
	for (const currentTx of preliminaryTransactions) {
		const isFragment = currentTx.date === null;
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

	return { dateRange, transactions: finalTransactions };
}
