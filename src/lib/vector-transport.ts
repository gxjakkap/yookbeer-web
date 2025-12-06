import { Writable } from "stream"

const VECTOR_URL = process.env.VECTOR_URL || "http://localhost:9070/ingest"
const SERVICE_NAME = process.env.SERVICE_NAME || "yookbeer-prod"

const BATCH_SIZE = 50
const FLUSH_MS = 2000

export class VectorTransport extends Writable {
	private queue: any[] = []
	private flushing = false
	private timer: NodeJS.Timeout

	constructor() {
		super()
		this.timer = setInterval(() => this.flush(), FLUSH_MS)
	}

	_write(
		chunk: any,
		encoding: string,
		callback: (error?: Error | null) => void
	) {
		const line = chunk.toString()
		if (!line.trim()) {
			callback()
			return
		}

		try {
			const obj = JSON.parse(line)
			this.queue.push({
				service: SERVICE_NAME,
				level: obj.level,
				msg: obj.msg,
				...obj,
				time: new Date().toISOString(),
			})

			if (this.queue.length >= BATCH_SIZE) {
				this.flush()
			}
			callback()
		} catch (err) {
			// If parsing fails, just ignore line or log error?
			// For now, we callback with error to be safe, or just ignore to keep stream alive.
			// Let's just callback.
			// Actually, pino might crash if we pass error back?
			// Safest to just ignore bad lines in transport.
			console.error("VectorTransport parse error:", err)
			callback()
		}
	}

	async flush() {
		if (this.flushing || this.queue.length === 0) return
		this.flushing = true

		const batch = this.queue.splice(0, BATCH_SIZE)
		const ndjson = batch.map((o) => JSON.stringify(o)).join("\n") + "\n"

		try {
			await fetch(VECTOR_URL, {
				method: "POST",
				headers: { "Content-Type": "application/x-ndjson" },
				body: ndjson,
			})
		} catch (err) {
			console.error("VectorTransport flush error:", err)
			// Re-queue failed batch
			this.queue.unshift(...batch)
		}

		this.flushing = false
	}
}
