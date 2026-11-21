// Run with: bun src/lib/report.check.ts
import assert from "node:assert"
import { reportSchema } from "./report"

const ok = (input: object) => {
	const r = reportSchema.safeParse({ stdid: "6707", ...input })
	assert.ok(r.success, JSON.stringify(r.error?.issues))
	return r.data
}
const failsOn = (input: object, path: string) => {
	const r = reportSchema.safeParse({ stdid: "6707", ...input })
	assert.ok(!r.success && r.error.issues.some((i) => i.path[0] === path), `expected error on ${path}`)
}

failsOn({ reasons: [] }, "reasons")
failsOn({ reasons: ["dead_socials"] }, "deadSocials")
failsOn({ reasons: ["wrong_info"] }, "wrongFields")
failsOn({ reasons: ["other"], note: "   " }, "note")
failsOn({ reasons: ["dead_socials"], deadSocials: ["myspace"] }, "deadSocials")

// extras for unticked reasons are dropped, blanks become null
assert.deepStrictEqual(
	ok({
		reasons: ["reassigned"],
		deadSocials: ["lineid"],
		wrongFields: ["phone"],
		newStdid: " 6807 ",
		note: "",
	}),
	{ stdid: "6707", reasons: ["reassigned"], deadSocials: [], wrongFields: [], newStdid: "6807", note: null }
)
assert.strictEqual(ok({ reasons: ["reassigned"] }).newStdid, null)
assert.deepStrictEqual(
	ok({ reasons: ["dead_socials", "other"], deadSocials: ["instagram"], note: "x" }).deadSocials,
	["instagram"]
)

console.log("report: ok")
