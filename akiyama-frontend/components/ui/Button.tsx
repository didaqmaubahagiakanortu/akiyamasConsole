interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
    children,
    ...props
}: ButtonProps) {
    return (
        <button {...props} className="bg-white p-2 px-7 rounded-xl text-pink-300 hover:cursor-pointer">
            {children}
        </button>
    )
}