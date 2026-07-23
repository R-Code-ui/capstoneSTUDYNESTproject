import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((prev) => !prev);
    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);
    return (
        <>
            <div onClick={toggleOpen}>{children}</div>
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white border border-gray-200 shadow-lg rounded-xl',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const [placement, setPlacement] = useState('bottom');

    useEffect(() => {
        if (open && triggerRef.current) {
            requestAnimationFrame(() => {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const contentHeight = contentRef.current?.offsetHeight || 200;
                const spaceBelow = window.innerHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;
                if (spaceBelow < contentHeight && spaceAbove > contentHeight) {
                    setPlacement('top');
                } else {
                    setPlacement('bottom');
                }
            });
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleResize = () => {
            if (triggerRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const contentHeight = contentRef.current?.offsetHeight || 200;
                const spaceBelow = window.innerHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;
                if (spaceBelow < contentHeight && spaceAbove > contentHeight) {
                    setPlacement('top');
                } else {
                    setPlacement('bottom');
                }
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize);
        };
    }, [open]);

    let alignmentClasses = 'origin-top';
    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';
    if (width === '48') widthClasses = 'w-48';

    // Placement overrides
    const placementClasses = {
        bottom: 'top-full mt-2',
        top: 'bottom-full mb-2',
    };
    // Also adjust origin for animation
    const originClasses = {
        bottom: 'origin-top',
        top: 'origin-bottom',
    };

    return (
        <>
            <div ref={triggerRef} /> {/* invisible spacer to get trigger position */}
            <Transition
                show={open}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    ref={contentRef}
                    className={`absolute z-50 rounded-xl ${placementClasses[placement]} ${originClasses[placement]} ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-xl ring-1 ring-black ring-opacity-5 overflow-hidden ${contentClasses}`}>
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={`block w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
