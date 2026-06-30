export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold uppercase tracking-wider text-[#434343] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
