import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm text-[#434343] transition-all duration-200 placeholder-neutral-400/60 focus:bg-white focus:border-[#5EC4D2] focus:ring-4 focus:ring-[#5EC4D2]/15 focus:outline-none ' +
                className
            }
            ref={localRef}
        />
    );
});
