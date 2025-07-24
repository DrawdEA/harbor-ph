"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Import the updated server action and the data types
import { processGcashPdf, uploadReceipt } from "./actions"; // Adjust path if actions.ts is not in the same directory
import { GcashExtractedData } from "@/lib/gcashReaders/betaManualReadInvoice"; // Adjust path based on your project structure

export default function GcashBetaClient() {
	// State for pending transitions for each section
	const [isPendingPdf, startTransitionPdf] = useTransition();
	const [isPendingReceipt, startTransitionReceipt] = useTransition();

	// State for Organizer section (PDF)
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [pdfPassword, setPdfPassword] = useState<string>("");
	const pdfInputRef = useRef<HTMLInputElement>(null); // Ref to clear file input
	const [extractedPdfData, setExtractedPdfData] = useState<GcashExtractedData | null>(null); // State to store extracted data

	// State for Client section (Receipt)
	const [receiptImage, setReceiptImage] = useState<File | null>(null);
	const receiptInputRef = useRef<HTMLInputElement>(null); // Ref to clear file input

	// Handler for PDF file input change
	const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setPdfFile(event.target.files[0]);
		} else {
			setPdfFile(null);
		}
		setExtractedPdfData(null); // Clear previous data when a new file is selected
	};

	// Handler for Receipt image input change
	const handleReceiptImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setReceiptImage(event.target.files[0]);
		} else {
			setReceiptImage(null);
		}
	};

	// Handles submission for PDF processing
	const handlePdfSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Prevent default form submission

		if (!pdfFile) {
			toast.error("Missing PDF File", {
				description: "Please select a PDF document to process.",
			});
			return;
		}

		if (!pdfPassword.trim()) {
			toast.error("Missing Password", {
				description: "Please enter the PDF password.",
			});
			return;
		}

		const formData = new FormData();
		formData.append("pdfFile", pdfFile);
		formData.append("password", pdfPassword);

		startTransitionPdf(async () => {
			const result = await processGcashPdf(formData); // Call the new server action
			if (result.success) {
				toast.success("PDF Processed Successfully!", {
					description:
						result.message +
						(result.data?.dateRange ? ` Date Range: ${result.data.dateRange}` : ""),
				});
				setExtractedPdfData(result.data || null); // Store the extracted data
				console.log("Extracted PDF Data:", result.data); // Log for debugging

				// Clear the form after successful processing
				setPdfFile(null);
				setPdfPassword("");
				if (pdfInputRef.current) pdfInputRef.current.value = "";
			} else {
				toast.error("Error Processing PDF", {
					description: result.message,
				});
				setExtractedPdfData(null); // Clear data on error
			}
		});
	};

	// Handles submission for receipt image upload (remains unchanged)
	const handleReceiptSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Prevent default form submission

		if (!receiptImage) {
			toast.error("Missing Receipt Image", {
				description: "Please select a receipt image to upload.",
			});
			return;
		}

		const formData = new FormData();
		formData.append("receiptImage", receiptImage);

		startTransitionReceipt(async () => {
			const result = await uploadReceipt(formData);
			if (result.success) {
				toast.success("Receipt Uploaded!", {
					description: result.message,
				});
				// Log processed data if available (for debugging/further use)
				console.log("Processed Receipt Data:", result.data);
				// Clear the form after successful upload
				setReceiptImage(null);
				if (receiptInputRef.current) receiptInputRef.current.value = "";
			} else {
				toast.error("Error Uploading Receipt", {
					description: result.message,
				});
			}
		});
	};

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="flex flex-col items-start justify-center md:flex-row md:space-x-8">
				{/* Organizer Portion: PDF Password Check / Processing */}
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
										aria-describedby="pdf-file-info"
									/>
									{pdfFile && (
										<p id="pdf-file-info" className="text-muted-foreground text-sm">
											Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
										</p>
									)}
								</div>
								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label htmlFor="pdfPassword">PDF Password</Label>
									<Input
										id="pdfPassword"
										type="password"
										placeholder="Enter PDF password (if any)"
										value={pdfPassword}
										onChange={(e) => setPdfPassword(e.target.value)}
										disabled={isPendingPdf}
									/>
								</div>
								<Button type="submit" disabled={isPendingPdf || !pdfFile || !pdfPassword.trim()}>
									{isPendingPdf ? "Processing PDF..." : "Process PDF"}
								</Button>
							</form>

							{/* Display extracted data summary if available */}
							{extractedPdfData && (
								<div className="mt-6 border-t pt-4">
									<h4 className="text-lg font-semibold">Extracted Data Summary:</h4>
									<p>
										<strong>Date Range:</strong> {extractedPdfData.dateRange || "N/A"}
									</p>
									<p>
										<strong>Total Transactions:</strong> {extractedPdfData.transactions.length}
									</p>
									{extractedPdfData.transactions.length > 0 && (
										<div className="text-muted-foreground mt-2 max-h-48 overflow-y-auto text-sm">
											<p className="font-medium">Sample Transactions:</p>
											<ul className="list-inside list-disc">
												{extractedPdfData.transactions.slice(0, 3).map((tx, index) => (
													<li key={index}>
														{tx.date}:{" "}
														{tx.description.substring(0, Math.min(tx.description.length, 50))}...
														(Debit: {tx.debit !== null ? tx.debit : "N/A"}, Credit:{" "}
														{tx.credit !== null ? tx.credit : "N/A"})
													</li>
												))}
												{extractedPdfData.transactions.length > 3 && (
													<li>... and {extractedPdfData.transactions.length - 3} more.</li>
												)}
											</ul>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Vertical Separator Bar */}
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
										aria-describedby="receipt-image-info"
									/>
									{receiptImage && (
										<p id="receipt-image-info" className="text-muted-foreground text-sm">
											Selected: {receiptImage.name} ({(receiptImage.size / 1024 / 1024).toFixed(2)}{" "}
											MB)
										</p>
									)}
								</div>
								<Button type="submit" disabled={isPendingReceipt || !receiptImage}>
									{isPendingReceipt ? "Uploading Receipt..." : "Upload Receipt"}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
