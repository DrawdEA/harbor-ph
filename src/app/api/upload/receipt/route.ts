import { NextResponse } from "next/server";
import { parseGcashReceipt } from "@/lib/gcashReaders/readReceipt";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		// 1. Validate the input
		if (!file) {
			return NextResponse.json({ message: "No receipt image file provided." }, { status: 400 });
		}

		if (!file.type.startsWith("image/")) {
			return NextResponse.json({ message: "Uploaded file is not a valid image." }, { status: 400 });
		}

		console.log(`Received file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

		// 2. Convert the file to a Buffer for processing
		const imageBuffer = Buffer.from(await file.arrayBuffer());

		// 3. Process the image using our dedicated parser
		const extractedData = await parseGcashReceipt(imageBuffer);

		// 4. Return the successful result
		return NextResponse.json(extractedData, { status: 200 });
	} catch (error: any) {
		// 5. Handle any errors during the process
		console.error("API Error - /api/upload/receipt:", error);
		return NextResponse.json(
			{ message: "Failed to process receipt image on the server.", error: error.message },
			{ status: 500 },
		);
	}
}
