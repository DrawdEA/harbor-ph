"use server";

import { parseGcashPdf, GcashExtractedData } from "@/lib/gcashReaders/readInvoice";
import { parseGcashReceipt, GcashReceiptData } from "@/lib/gcashReaders/readReceipt";

// Define a consistent result type for our actions
type ActionResult<T> =
	| { success: true; message: string; data: T }
	| { success: false; message: string; data?: null };

/**
 * Processes a GCash PDF statement, extracting transaction data.
 */
export async function processGcashPdf(
	formData: FormData,
): Promise<ActionResult<GcashExtractedData>> {
	const pdfFile = formData.get("pdfFile") as File | null;
	const password = formData.get("password") as string | null;

	if (!pdfFile || !password) {
		return { success: false, message: "PDF file and password are required." };
	}

	if (pdfFile.size === 0) {
		return { success: false, message: "Uploaded PDF file is empty." };
	}

	const MAX_PDF_SIZE_MB = 20;
	if (pdfFile.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
		return { success: false, message: `PDF file size exceeds ${MAX_PDF_SIZE_MB}MB.` };
	}

	try {
		const arrayBuffer = await pdfFile.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		const extractedData = await parseGcashPdf(uint8Array, password);

		if (extractedData && extractedData.transactions.length > 0) {
			console.log("GCash PDF processed successfully.");
			const message = `Extracted ${extractedData.transactions.length} transactions.`;
			return { success: true, message, data: extractedData };
		} else {
			console.error("GCash PDF processing failed: No transactions found or parser failed.");
			return { success: false, message: "Failed to parse PDF or no transactions were found." };
		}
	} catch (error: any) {
		console.error("An unexpected error occurred during GCash PDF processing:", error);
		// Check for common errors like wrong password
		if (error.message && error.message.toLowerCase().includes("password")) {
			return { success: false, message: "Incorrect PDF password." };
		}
		return { success: false, message: `An unexpected server error occurred: ${error.message}` };
	}
}

/**
 * Uploads a receipt image, processes it on the server, and returns the data.
 */
export async function uploadReceipt(
	formData: FormData,
): Promise<ActionResult<GcashReceiptData>> { // Use the correct return type
	const receiptImage = formData.get("receiptImage") as File | null;

	if (!receiptImage) {
		return { success: false, message: "Receipt image is required." };
	}

	if (!receiptImage.type.startsWith("image/")) {
		return { success: false, message: "Please upload a valid image file." };
	}

	const MAX_IMAGE_SIZE_MB = 10;
	if (receiptImage.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
		return { success: false, message: `Receipt image size exceeds ${MAX_IMAGE_SIZE_MB}MB.` };
	}

	try {
		// Convert the File to a Buffer for the OCR function
		const arrayBuffer = await receiptImage.arrayBuffer();
		const imageBuffer = Buffer.from(arrayBuffer);

		// Directly call your OCR function
		const extractedData = await parseGcashReceipt(imageBuffer);

		// Check if we got at least some data
		if (!extractedData.referenceNumber && !extractedData.amount) {
			return { success: false, message: "Could not extract key details from the receipt. Please try a clearer image." };
		}
		
		return {
			success: true,
			message: "Receipt processed successfully!",
			data: extractedData,
		};
	} catch (error: any) {
		console.error("Error processing receipt on server:", error);
		return { success: false, message: `An error occurred during receipt processing: ${error.message}` };
	}
}