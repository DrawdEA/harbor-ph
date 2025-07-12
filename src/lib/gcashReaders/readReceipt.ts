import { createWorker } from "tesseract.js";

// TODO: Add error management
export async function readImage(URL: string) {
	const worker = await createWorker("eng");
	const ret = await worker.recognize(URL);

	console.log(ret);

	await worker.terminate();
}
