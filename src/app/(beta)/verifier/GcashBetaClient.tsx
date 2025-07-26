"use client";

import { useState, useTransition, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Actions are only needed for the PDF part now
import { processGcashPdf } from "./actions";
import { GcashInvoiceExtractedData } from "@/lib/gcashReaders/readInvoice";

// Import our new client-safe parser and its types
import { GcashReceiptData, parseOcrText } from "@/lib/gcashReaders/parseReceipt";

export default function GcashBetaClient() {
	// --- PDF Processing State (Server-Side) ---
	const [isPendingPdf, startTransitionPdf] = useTransition();
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [pdfPassword, setPdfPassword] = useState<string>("");
	const pdfInputRef = useRef<HTMLInputElement>(null);
	const [extractedPdfData, setExtractedPdfData] = useState<GcashInvoiceExtractedData | null>(null);

	// --- Receipt Processing State (Client-Side) ---
	const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
	const [ocrProgress, setOcrProgress] = useState({ status: "idle", progress: 0 });
	const [receiptImage, setReceiptImage] = useState<File | null>(null);
	const receiptInputRef = useRef<HTMLInputElement>(null);
	const [receiptData, setReceiptData] = useState<GcashReceiptData | null>(null);

	const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setPdfFile(file);
		if (file) {
			setExtractedPdfData(null);
		}
	};

	const handleReceiptImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setReceiptImage(file);
		if (file) {
			setReceiptData(null); // Clear previous data on new file selection
			setOcrProgress({ status: "idle", progress: 0 });
		}
	};

	const handlePdfSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!pdfFile) {
			toast.error("Missing PDF File", { description: "Please select a PDF to process." });
			return;
		}
		if (!pdfPassword.trim()) {
			toast.error("Missing Password", { description: "Please enter the PDF password." });
			return;
		}

		const formData = new FormData();
		formData.append("pdfFile", pdfFile);
		formData.append("password", pdfPassword);

		startTransitionPdf(async () => {
			try {
				const result = await processGcashPdf(formData);

				if (result.success) {
					toast.success("PDF Processed Successfully!", {
						description: `${result.message} Date Range: ${result.data.dateRange || "N/A"}`,
					});
					setExtractedPdfData(result.data);
					setPdfFile(null);
					setPdfPassword("");
					if (pdfInputRef.current) pdfInputRef.current.value = "";
				} else {
					toast.error("Error Processing PDF", { description: result.message });
					setExtractedPdfData(null);
				}
			} catch (error) {
				toast.error("An Unexpected Error Occurred", {
					description: "Could not connect to the server. Please try again.",
				});
				setExtractedPdfData(null);
			}
		});
	};

	const handleReceiptSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!receiptImage) {
			toast.error("Missing Receipt Image", { description: "Please select an image to process." });
			return;
		}

		setIsProcessingReceipt(true);
		setReceiptData(null);
		toast.info("Starting OCR process in your browser...", {
			description: "This may take a moment.",
		});

		let worker;
		try {
			worker = await createWorker("eng");

			const {
				data: { text },
			} = await worker.recognize(receiptImage);
			console.log("OCR Raw Text Output:\n---", text, "\n---");

			const extractedData = parseOcrText(text);
			console.log("Parsed Receipt Data:", extractedData);
			setReceiptData(extractedData);
			toast.success("Receipt Processed Successfully!");
		} catch (error) {
			console.error("Error during client-side OCR:", error);
			toast.error("OCR Failed", {
				description: "Could not read the receipt. Please try a clearer image or try again.",
			});
			setReceiptData(null);
		} finally {
			await worker?.terminate();
			setIsProcessingReceipt(false);
			setOcrProgress({ status: "Done", progress: 100 });
			setReceiptImage(null);
			if (receiptInputRef.current) receiptInputRef.current.value = "";
		}
	};

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="flex flex-col items-start justify-center md:flex-row md:space-x-8">
				{/* Organizer Portion: PDF Processing */}
				<div className="mb-8 w-full md:mb-0 md:w-1/2">
					<Card>
						<CardHeader>
							<CardTitle>Organizer Portal</CardTitle>
							<CardDescription>Upload and process a GCash PDF statement.</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePdfSubmit} className="space-y-4">
								{/* ... PDF form inputs ... */}
								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label htmlFor="pdfFile">GCash PDF Statement</Label>
									<Input
										id="pdfFile"
										type="file"
										accept=".pdf"
										onChange={handlePdfFileChange}
										ref={pdfInputRef}
										disabled={isPendingPdf}
									/>
								</div>
								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label htmlFor="pdfPassword">PDF Password</Label>
									<Input
										id="pdfPassword"
										type="password"
										placeholder="Enter PDF password"
										value={pdfPassword}
										onChange={(e) => setPdfPassword(e.target.value)}
										disabled={isPendingPdf}
									/>
								</div>
								<Button type="submit" disabled={isPendingPdf || !pdfFile || !pdfPassword.trim()}>
									{isPendingPdf ? "Processing PDF..." : "Process PDF"}
								</Button>
							</form>

							{extractedPdfData && (
								<div className="mt-6 border-t pt-4">
									<h4 className="text-lg font-semibold">PDF Extraction Result:</h4>
									{/* ... PDF results display ... */}
									<details className="mt-4">
										<summary className="cursor-pointer font-medium hover:underline">
											View Full Extracted JSON
										</summary>
										<pre className="mt-2 w-full overflow-x-auto rounded-md bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
											<code>{JSON.stringify(extractedPdfData, null, 2)}</code>
										</pre>
									</details>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="my-4 hidden w-px self-stretch bg-gray-300 md:my-0 md:block dark:bg-gray-700"></div>

				{/* Client Portion: Receipt Upload */}
				<div className="w-full md:w-1/2">
					<Card>
						<CardHeader>
							<CardTitle>Client Portal</CardTitle>
							<CardDescription>Upload a photo of your receipt for processing.</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleReceiptSubmit} className="space-y-4">
								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label htmlFor="receiptImage">Receipt Image</Label>
									<Input
										id="receiptImage"
										type="file"
										accept="image/*"
										onChange={handleReceiptImageChange}
										ref={receiptInputRef}
										disabled={isProcessingReceipt}
									/>
									{receiptImage && (
										<p className="text-muted-foreground text-sm">Selected: {receiptImage.name}</p>
									)}
								</div>
								<Button
									type="submit"
									disabled={isProcessingReceipt || !receiptImage}
									className="w-full max-w-sm"
								>
									{isProcessingReceipt
										? `${ocrProgress.status} ${ocrProgress.progress > 0 ? ocrProgress.progress + "%" : ""}`
										: "Process Receipt"}
								</Button>
							</form>

							{/* --- NEW: Display extracted receipt data --- */}
							{receiptData && (
								<div className="mt-6 space-y-2 border-t pt-4">
									<h4 className="text-lg font-semibold">Receipt Extraction Result:</h4>
									<p>
										<strong>Recipient:</strong> {receiptData.recipientName || "N/A"}
									</p>
									<p>
										<strong>Number:</strong> {receiptData.recipientNumber || "N/A"}
									</p>
									<p>
										<strong>Amount:</strong>{" "}
										{receiptData.amount ? `₱${receiptData.amount.toFixed(2)}` : "N/A"}
									</p>
									<p>
										<strong>Ref No:</strong> {receiptData.referenceNumber || "N/A"}
									</p>
									<p>
										<strong>Date:</strong>{" "}
										{receiptData.timestamp ? receiptData.timestamp.toLocaleString() : "N/A"}
									</p>

									<details className="pt-2">
										<summary className="cursor-pointer font-medium hover:underline">
											View Full JSON
										</summary>
										<pre className="mt-2 w-full overflow-x-auto rounded-md bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
											<code>
												{JSON.stringify(
													receiptData,
													(key, value) =>
														key === "timestamp" && value ? new Date(value).toISOString() : value,
													2,
												)}
											</code>
										</pre>
									</details>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
