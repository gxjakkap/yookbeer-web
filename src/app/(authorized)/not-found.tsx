import { NotFoundMessage } from "@/components/not-found-message"

export default function NotFound() {
	return (
		<div className="flex items-center justify-center" style={{ minHeight: "calc(90vh - 4rem)" }}>
			<NotFoundMessage />
		</div>
	)
}
