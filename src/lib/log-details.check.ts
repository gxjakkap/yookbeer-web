// Run with: bun src/lib/log-details.check.ts
import assert from "node:assert"
import {
	apiKeyCreatedRows,
	apiKeyDeletedRows,
	apiKeyEditedRows,
	editDiff,
	inviteClaimRows,
	inviteRows,
	takeoutRows,
} from "./log-details"

// only changed fields appear, old value before new
assert.deepStrictEqual(
	editDiff(
		JSON.stringify({
			before: { nicken: "Old", phone: "081", facebook: null },
			after: { nicken: "New", phone: "081", facebook: "fb" },
		})
	),
	[
		{ sign: "-", text: 'nicken: "Old"' },
		{ sign: "+", text: 'nicken: "New"' },
		{ sign: "-", text: "facebook: null" },
		{ sign: "+", text: 'facebook: "fb"' },
	]
)

// saving without changes is an empty diff, not a failed parse
assert.deepStrictEqual(editDiff(JSON.stringify({ before: { phone: "081" }, after: { phone: "081" } })), [])

// no previous row means additions only
assert.deepStrictEqual(editDiff(JSON.stringify({ after: { phone: "081" } })), [
	{ sign: "+", text: 'phone: "081"' },
])

// image entries
assert.deepStrictEqual(editDiff("image updated: a.jpg → b.png"), [
	{ sign: "-", text: 'img: "a.jpg"' },
	{ sign: "+", text: 'img: "b.png"' },
])
assert.deepStrictEqual(editDiff("image updated: (none) → b.png"), [{ sign: "+", text: 'img: "b.png"' }])
assert.strictEqual(editDiff("image updated: a.jpg → a.jpg"), null)

// edit_usr format, including a value that contains the separator
assert.deepStrictEqual(
	editDiff(
		`existing data: ${JSON.stringify({ id: "u1", name: "a, new data: b", role: "user", image: "x" })}, new data: ${JSON.stringify({ id: "u1", data: { id: "u1", name: "a, new data: b", role: "admin" } })}`
	),
	[
		{ sign: "-", text: 'role: "user"' },
		{ sign: "+", text: 'role: "admin"' },
	]
)
assert.strictEqual(editDiff("existing data: {broken, new data: {}"), null)

// older entries have no previous values to compare
assert.strictEqual(editDiff('new data: {"id":"1","data":{"phone":"081"}}'), null)
assert.strictEqual(editDiff("null"), null)

// takeout: stored ids become the labels used on the export form
assert.deepStrictEqual(
	takeoutRows(
		JSON.stringify({
			onlyAttending: false,
			including: ["stdid", "nameth", "unknown"],
			format: "csv",
			includedCourse: [0, 9],
			includedGen: [38, 39],
			createdBy: "u1",
			mode: "s3",
		})
	),
	[
		{ label: "Students", value: "All students" },
		{ label: "Format", value: "CSV" },
		{ label: "Generations", value: "38, 39" },
		{ label: "Courses", value: "Regular Program, 9" },
		{ label: "Columns", value: "Student ID, Name (TH), unknown" },
		{ label: "Delivery", value: "Download link" },
	]
)
assert.strictEqual(takeoutRows("not json"), null)
assert.strictEqual(takeoutRows('{"format":"csv"}'), null)

// invites
const inviteCode = [{ label: "Invite code", value: "ABC123" }]
assert.deepStrictEqual(inviteRows("created invite ABC123"), inviteCode)
assert.deepStrictEqual(inviteRows("removed invite ABC123"), inviteCode)
assert.strictEqual(inviteRows("something else"), null)
assert.deepStrictEqual(
	inviteClaimRows(
		JSON.stringify({ code: "ABC123", valid: false, status: "invite code already used", usedBy: "u1" })
	),
	[...inviteCode, { label: "Result", value: "Invite code already used" }]
)
assert.strictEqual(inviteClaimRows("not json"), null)

// api keys
assert.deepStrictEqual(apiKeyCreatedRows("key: k-1"), [{ label: "API key", value: "k-1" }])
assert.deepStrictEqual(apiKeyDeletedRows("deleted key k-1 owned by u1"), [
	{ label: "API key", value: "k-1" },
	{ label: "Owner ID", value: "u1" },
])
assert.deepStrictEqual(apiKeyEditedRows('new data: {"id":5,"data":{"name":"ci","expiresAt":null}}'), [
	{ label: "Key ID", value: "5" },
	{ label: "Name", value: "ci" },
	{ label: "Expires", value: "Never" },
])
assert.strictEqual(apiKeyEditedRows('{"id":5}'), null)

console.log("log-details: ok")
