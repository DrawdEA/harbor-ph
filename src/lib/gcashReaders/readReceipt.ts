import { createWorker } from "tesseract.js";
import path from "path";

/**
 * Defines the structure of the data extracted from a GCash receipt image.
 */
export interface GcashReceiptData {
	recipientName: string | null;
	recipientNumber: string | null;
	amount: number | null;
	referenceNumber: string | null;
	timestamp: Date | null;
}

/**
 * Parses the raw text extracted from a GCash receipt image into a structured object.
 * @param rawText The raw string output from the Tesseract OCR engine.
 * @returns A GcashReceiptData object with the parsed information.
 */
function parseOcrText(rawText: string): GcashReceiptData {
	const lines = rawText.split("\n");
	const data: GcashReceiptData = {
		recipientName: null,
		recipientNumber: null,
		amount: null,
		referenceNumber: null,
		timestamp: null,
	};

	// Regex patterns to find the data we need
	const refAndDateRegex = /Ref No\.\s*(\d+)\s+(.+)/;
	const amountRegex = /Total Amount Sent\s*₱?([\d,]+\.\d{2})/;
	const nameAndNumberRegex = /([A-Za-z\s,.\-]+?)\s*\+63\s*(\d+)/;

	for (const line of lines) {
		// Find Reference Number and Timestamp
		const refMatch = line.match(refAndDateRegex);
		if (refMatch) {
			data.referenceNumber = refMatch[1].trim();
			// Attempt to parse the date string into a valid Date object
			const dateString = refMatch[2].trim();
			const parsedDate = new Date(dateString);
			// Check if the date is valid before assigning
			if (!isNaN(parsedDate.getTime())) {
				data.timestamp = parsedDate;
			}
			continue; // Move to the next line
		}

		// Find Amount
		const amountMatch = line.match(amountRegex);
		if (amountMatch) {
			// Remove commas and parse to a float
			data.amount = parseFloat(amountMatch[1].replace(/,/g, ""));
			continue;
		}

		// Find Recipient Name and Number
		const nameMatch = line.match(nameAndNumberRegex);
		if (nameMatch) {
			// This regex is designed to capture the name that often appears on the
			// same line as the number, like in your sample image.
			data.recipientName = nameMatch[1].trim();
			data.recipientNumber = `+63${nameMatch[2].replace(/\s/g, "")}`;
			continue;
		}
	}

	// Fallback for name if it's on a different line
	if (!data.recipientName) {
		const sentViaIndex = lines.findIndex((line) => line.includes("Sent via GCash"));
		if (sentViaIndex > 0) {
			// The name is typically the line right above "Sent via GCash"
			const potentialNameLine = lines[sentViaIndex - 1];
			// A simple check to see if it's not the number or something else
			if (potentialNameLine && isNaN(parseFloat(potentialNameLine))) {
				data.recipientName = potentialNameLine.trim();
			}
		}
	}

	return data;
}

/**
 * Reads a GCash receipt image from a buffer, performs OCR, and extracts transaction details.
 * @param imageBuffer The image file as a Buffer.
 * @returns A promise that resolves to the structured GcashReceiptData.
 */
export async function parseGcashReceipt(imageBuffer: Buffer): Promise<GcashReceiptData> {
	// Point ONLY to the language data, which is now at the project root.
	// Tesseract.js will handle its own worker and core paths automatically in this setup.
	const langPath = path.join(process.cwd(), "lang-data");

	const worker = await createWorker("eng", 1, {
		// No workerPath, No corePath. Let the library resolve them.
		langPath,
		// Cache the language data in the specified directory.
		cachePath: path.join(process.cwd(), "lang-data"),
		// Optional logger
		logger: m => console.log(m),
	});

	try {
		console.log("Starting OCR process on receipt image...");
		const {
			data: { text },
		} = await worker.recognize(imageBuffer);

		console.log("OCR Raw Text Output:\n---", text, "\n---");

		const extractedData = parseOcrText(text);
		console.log("Parsed Receipt Data:", extractedData);

		return extractedData;
	} catch (error) {
		console.error("Error during receipt OCR processing:", error);
		throw new Error("Failed to read text from the receipt image.");
	} finally {
		await worker.terminate();
		console.log("Tesseract worker terminated.");
	}
}