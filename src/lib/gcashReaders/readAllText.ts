import { createWorker } from "tesseract.js";

export async function readAllText(URL: string) {
	const worker = await createWorker("eng");
	const ret = await worker.recognize(URL);

	console.log(ret);

	await worker.terminate();
}
