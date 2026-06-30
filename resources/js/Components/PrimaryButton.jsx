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
                `inline-flex items-center rounded-xl bg-[#5EC4D2] px-5 py-3.5 text-xs font-extrabold uppercase tracking-widest text-[#22486A] shadow-md shadow-cyan-500/5 transition duration-200 ease-in-out hover:bg-[#7DD3E1] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#5EC4D2]/30 active:scale-[0.99] ${
                    disabled && 'opacity-40 pointer-events-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
