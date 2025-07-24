"use server";

import { parseGcashPdf } from "@/lib/gcashReaders/readInvoice";

/**
 * Processes a GCash PDF statement, extracting transaction data.
 * This function runs on the server.
 *
 * @param formData - FormData containing 'pdfFile' (File) and 'password' (string).
 * @returns An object indicating success/failure, a message, and optionally the extracted data.
 */
export async function processGcashPdf(formData: FormData) {
	const pdfFile = formData.get("pdfFile") as File | null;
	const password = formData.get("password") as string | null;

	if (!pdfFile || !password) {
		return { success: false, message: "PDF file and password are required." };
	}

	if (pdfFile.size === 0) {
		return { success: false, message: "Uploaded PDF file is empty." };
	}

	const MAX_PDF_SIZE_MB = 20; // Set your desired max PDF size
	if (pdfFile.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
		return { success: false, message: `PDF file size exceeds ${MAX_PDF_SIZE_MB}MB.` };
	}

	// Convert the File object to a Uint8Array for pdf.js-extract
	const arrayBuffer = await pdfFile.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);

	console.log("Attempting to process GCash PDF...");

	try {
		const result = await parseGcashPdf(uint8Array, password);

		if (result.success) {
			console.log("GCash PDF processed successfully.");
			// You can now store `result.data` in your database or process it further.
			return { success: true, message: result.message, data: result.data };
		} else {
			console.error("GCash PDF processing failed:", result.message);
			return { success: false, message: result.message };
		}
	} catch (error: any) {
		console.error("An unexpected error occurred during GCash PDF processing:", error);
		return { success: false, message: `An unexpected server error occurred: ${error.message}` };
	}
}

/**
 * Uploads a receipt image to an external API endpoint for processing.
 * This function runs on the server.
 *
 * @param formData - FormData containing 'receiptImage' (File).
 * @returns An object indicating success/failure, a message, and optional data from the API.
 */
export async function uploadReceipt(formData: FormData) {
	const receiptImage = formData.get("receiptImage") as File | null;

	if (!receiptImage) {
		return { success: false, message: "Receipt image is required." };
	}

	if (!receiptImage.type.startsWith("image/")) {
		return { success: false, message: "Please upload a valid image file." };
	}

	const MAX_IMAGE_SIZE_MB = 10; // Example limit: 10MB
	if (receiptImage.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
		return { success: false, message: `Receipt image size exceeds ${MAX_IMAGE_SIZE_MB}MB.` };
	}

	// Define the external API endpoint
	const externalApiEndpoint =
		process.env.RECEIPT_PROCESSING_API_URL || "http://localhost:3001/api/process-receipt";

	try {
		const apiFormData = new FormData();
		// Append the file using the field name expected by your external API (e.g., 'file' or 'receipt')
		apiFormData.append("file", receiptImage);

		// Make a POST request to the external API
		const response = await fetch(externalApiEndpoint, {
			method: "POST",
			body: apiFormData,
			// If your API requires authentication (e.g., API key, Bearer token), add headers here:
			// headers: {
			//   'Authorization': `Bearer ${process.env.YOUR_API_KEY}`,
			// },
		});

		if (!response.ok) {
			// Attempt to parse error message from the API response
			const errorData = await response
				.json()
				.catch(() => ({ message: "Unknown error from external API." }));
			console.error("Receipt processing API error:", response.status, errorData);
			return {
				success: false,
				message: `Failed to process receipt: ${errorData.message || response.statusText}`,
			};
		}

		const result = await response.json();
		return { success: true, message: "Receipt uploaded and processed successfully!", data: result };
	} catch (error: any) {
		console.error("Error uploading receipt:", error);
		return { success: false, message: `An error occurred during receipt upload: ${error.message}` };
	}
}
