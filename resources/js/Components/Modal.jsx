import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { Fragment } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    title = '',
    footer = null,
    size = 'md',
    showCloseButton = true,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    className = '',
    titleClassName = '',
    bodyClassName = '',
    footerClassName = '',
    overlayClassName = '',
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    // Size mapping
    const sizeClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        full: 'sm:max-w-7xl',
    };

    const maxWidthClass = sizeClasses[size] || sizeClasses['2xl'];

    // Handle overlay click
    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            close();
        }
    };

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={closeOnEscape ? close : () => {}}
                static={!closeOnEscape}
            >
                {/* Overlay */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className={`absolute inset-0 bg-gray-500/75 dark:bg-gray-900/80 ${overlayClassName}`}
                        onClick={handleOverlayClick}
                    />
                </TransitionChild>

                {/* Modal Panel */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`
                            mb-6 transform overflow-hidden rounded-lg
                            bg-white dark:bg-gray-800
                            shadow-xl transition-all
                            sm:mx-auto sm:w-full
                            ${maxWidthClass}
                            ${className}
                        `}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className={`
                                flex items-center justify-between
                                px-6 py-4
                                border-b border-gray-200 dark:border-gray-700
                                ${titleClassName}
                            `}>
                                {title && (
                                    <DialogTitle
                                        as="h3"
                                        className="text-lg font-semibold text-gray-900 dark:text-white"
                                    >
                                        {title}
                                    </DialogTitle>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={close}
                                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className={`px-6 py-4 ${bodyClassName}`}>
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className={`
                                px-6 py-4
                                border-t border-gray-200 dark:border-gray-700
                                ${footerClassName}
                            `}>
                                {footer}
                            </div>
                        )}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

// ============================================================
// HELPER: CONFIRMATION MODAL
// ============================================================

export function ConfirmModal({
    show = false,
    onClose = () => {},
    onConfirm = () => {},
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'blue',
    loading = false,
    size = 'sm',
    danger = false,
    icon = null,
}) {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    };

    const finalColor = danger ? 'red' : confirmColor;

    const icons = {
        warning: (
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        ),
        danger: (
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </div>
        ),
        success: (
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
        info: (
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
    };

    const iconType = danger ? 'danger' : 'warning';

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size={size}
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            px-4 py-2 text-sm font-medium text-white rounded-md
                            ${colorClasses[finalColor]}
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${finalColor}-500
                            transition-colors
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            }
        >
            <div className="sm:flex sm:items-start">
                {icon ? (
                    <div className="mx-auto flex-shrink-0 sm:mx-0">{icon}</div>
                ) : (
                    <div className="mx-auto flex-shrink-0 sm:mx-0">{icons[iconType]}</div>
                )}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                    </p>
                </div>
            </div>
        </Modal>
    );
}

// ============================================================
// HELPER: LOADING MODAL
// ============================================================

export function LoadingModal({
    show = false,
    title = 'Loading...',
    message = 'Please wait while we process your request.',
    spinner = true,
}) {
    return (
        <Modal
            show={show}
            onClose={() => {}}
            closeable={false}
            showCloseButton={false}
            size="sm"
            title={title}
        >
            <div className="flex flex-col items-center py-4">
                {spinner && (
                    <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
                    {message}
                </p>
            </div>
        </Modal>
    );
}

// ============================================================
// HELPER: SUCCESS MODAL
// ============================================================

export function SuccessModal({
    show = false,
    onClose = () => {},
    title = 'Success!',
    message = 'Operation completed successfully.',
    buttonText = 'OK',
}) {
    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {buttonText}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col items-center py-4">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
                    {message}
                </p>
            </div>
        </Modal>
    );
}

// ============================================================
// HELPER: ERROR MODAL
// ============================================================

export function ErrorModal({
    show = false,
    onClose = () => {},
    title = 'Error!',
    message = 'Something went wrong. Please try again.',
    buttonText = 'OK',
}) {
    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        {buttonText}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col items-center py-4">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
                    {message}
                </p>
            </div>
        </Modal>
    );
}
