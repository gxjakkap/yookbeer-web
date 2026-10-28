interface VersionInfoProps {
	sha: string
	commitMsg: string
	buildDate: string
}

export function VersionInfo(props: VersionInfoProps) {
	return (
		<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
			<div className="flex gap-x-1">
				<dt>Version</dt>
				<dd className="font-mono">{props.sha.substring(0, 7)}</dd>
			</div>
			<div className="flex min-w-0 gap-x-1">
				<dt>Commit</dt>
				<dd className="truncate">{props.commitMsg}</dd>
			</div>
			<div className="flex gap-x-1">
				<dt>Built</dt>
				<dd className="tabular-nums">{props.buildDate}</dd>
			</div>
		</dl>
	)
}
