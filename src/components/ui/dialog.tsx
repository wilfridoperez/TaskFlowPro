import * as React from "react"

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => (
    <>
        {React.Children.map(children, (child) =>
            React.isValidElement(child) && child.type === DialogTrigger
                ? React.cloneElement(child as React.ReactElement<{ onClick: () => void }>, {
                    onClick: () => onOpenChange(true),
                })
                : null
        )}
        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="fixed inset-0 bg-black/50"
                    onClick={() => onOpenChange(false)}
                />
                {React.Children.map(children, (child) =>
                    React.isValidElement(child) && child.type === DialogContent ? child : null
                )}
            </div>
        )}
    </>
)

const DialogTrigger = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
)

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative z-50 bg-white rounded-lg shadow-lg p-6 max-w-lg ${className || ''}`}>
        {children}
    </div>
)

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4">{children}</div>
)

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold">{children}</h2>
)

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-gray-600">{children}</p>
)

const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
        {children}
    </button>
))
DialogClose.displayName = "DialogClose"

const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
    Dialog,
    DialogPortal,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogDescription,
}
