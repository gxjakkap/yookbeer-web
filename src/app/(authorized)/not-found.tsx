export default function NotFound() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-6" style={{ minHeight: 'calc(90vh - 4rem)'}}>
                <h1 className="text-[48px] font-medium leading-none">404</h1>
                <div className="w-px h-16 bg-black/10" />
                <h2 className="text-[24px] leading-none">This page could not be found.</h2>
            </div>
        </div>
    )
}
  
  