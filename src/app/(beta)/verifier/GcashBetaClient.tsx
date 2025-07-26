"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { processGcashPdf, uploadReceipt } from "./actions";
import { GcashExtractedData } from "@/lib/gcashReaders/readInvoice";

export default function GcashBetaClient() {
	const [isPendingPdf, startTransitionPdf] = useTransition();
	const [isPendingReceipt, startTransitionReceipt] = useTransition();

	// Organizer section state
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [pdfPassword, setPdfPassword] = useState<string>("");
	const pdfInputRef = useRef<HTMLInputElement>(null);
	const [extractedPdfData, setExtractedPdfData] = useState<GcashExtractedData | null>(null);

	// Client section state
	const [receiptImage, setReceiptImage] = useState<File | null>(null);
	const receiptInputRef = useRef<HTMLInputElement>(null);

	const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setPdfFile(file);
		if (file) {
			setExtractedPdfData(null); // Clear previous data when a new file is selected
		}
	};

	const handleReceiptImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setReceiptImage(file);
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
					setExtractedPdfData(result.data); // Store the full extracted data
					console.log("Extracted PDF Data:", result.data);

					// Clear the form after successful processing
					setPdfFile(null);
					setPdfPassword("");
					if (pdfInputRef.current) pdfInputRef.current.value = "";
				} else {
					toast.error("Error Processing PDF", { description: result.message });
					setExtractedPdfData(null); // Clear data on error
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
			toast.error("Missing Receipt Image", { description: "Please select an image to upload." });
			return;
		}

		const formData = new FormData();
		formData.append("receiptImage", receiptImage);

		startTransitionReceipt(async () => {
			const result = await uploadReceipt(formData);
			if (result.success) {
				toast.success("Receipt Uploaded!", { description: result.message });
				console.log("Processed Receipt Data:", result.data);
				setReceiptImage(null);
				if (receiptInputRef.current) receiptInputRef.current.value = "";
			} else {
				toast.error("Error Uploading Receipt", { description: result.message });
			}
		});
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
									{pdfFile && (
										<p className="text-muted-foreground text-sm">
											Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
										</p>
									)}
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

							{/* --- NEW: Display extracted data summary AND full JSON --- */}
							{extractedPdfData && (
								<div className="mt-6 border-t pt-4">
									<h4 className="text-lg font-semibold">Extraction Result:</h4>
									<p>
										<strong>Date Range:</strong> {extractedPdfData.dateRange || "N/A"}
									</p>
									<p>
										<strong>Total Transactions:</strong> {extractedPdfData.transactions.length}
									</p>

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

				{/* Vertical Separator */}
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
										disabled={isPendingReceipt}
									/>
									{receiptImage && (
										<p className="text-muted-foreground text-sm">
											Selected: {receiptImage.name} ({(receiptImage.size / 1024 / 1024).toFixed(2)}{" "}
											MB)
										</p>
									)}
								</div>
								<Button type="submit" disabled={isPendingReceipt || !receiptImage}>
									{isPendingReceipt ? "Uploading..." : "Upload Receipt"}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
