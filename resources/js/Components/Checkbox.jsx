export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-neutral-300 text-[#1C56A6] shadow-sm focus:ring-[#5EC4D2] focus:ring-offset-0 transition duration-150 cursor-pointer ' +
                className
            }
        />
    );
}
