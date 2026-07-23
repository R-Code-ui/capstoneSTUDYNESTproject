export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded-md border-slate-300 text-[#4ECDC4] shadow-sm focus:ring-[#4ECDC4] focus:ring-offset-0 transition duration-150 cursor-pointer accent-[#4ECDC4] ' +
                className
            }
        />
    );
}
