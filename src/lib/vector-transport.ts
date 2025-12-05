import { once } from "events"
import split2 from "split2"

const VECTOR_URL = process.env.VECTOR_URL || "http://localhost:9070/ingest"
const SERVICE_NAME = process.env.SERVICE_NAME || "yookbeer-prod"

const BATCH_SIZE = 50
const FLUSH_MS = 2000

const queue: any[] = []
let flushing = false

async function flush() {
	if (flushing || queue.length === 0) return
	flushing = true

	const batch = queue.splice(0, BATCH_SIZE)
	const ndjson = batch.map((o) => JSON.stringify(o)).join("\n") + "\n"

	try {
		await fetch(VECTOR_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-ndjson" },
			body: ndjson,
		})
	} catch (err) {
		queue.unshift(...batch)
	}

	flushing = false
}

process.stdin.pipe(split2()).on("data", (line) => {
	if (!line.trim()) return

	const obj = JSON.parse(line)
	queue.push({
		service: SERVICE_NAME,
		level: obj.level,
		msg: obj.msg,
		...obj,
		time: new Date().toISOString(),
	})

	if (queue.length >= BATCH_SIZE) flush()
})

setInterval(flush, FLUSH_MS)

await once(process.stdin, "end")
