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
                'w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm font-medium transition-all duration-200 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 focus:outline-none shadow-sm ' +
                className
            }
            ref={localRef}
        />
    );
});
