import { Card, CardContent } from "./ui/card"

interface VersionInfoProps {
	sha: string
	commitMsg: string
	buildDate: string
}

export function VersionInfo(props: VersionInfoProps) {
	return (
		<Card className="mx-10 my-5 flex flex-col justify-center">
			<CardContent>
				<div className="flex flex-col gap-1 py-4">
					<div className="flex gap-x-1">
						<span className="font-bold">Git SHA:</span>
						{props.sha}
					</div>
					<div className="flex gap-x-1">
						<span className="font-bold">Commit:</span>
						{props.commitMsg}
					</div>
					<div className="flex gap-x-1">
						<span className="font-bold">Build Date:</span>
						{props.buildDate}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
