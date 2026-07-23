export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition duration-200 ease-in-out hover:bg-blue-700 hover:shadow focus:outline-none focus:ring-4 focus:ring-blue-500/40 active:scale-[0.98] ${
                    disabled && 'opacity-50 pointer-events-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
