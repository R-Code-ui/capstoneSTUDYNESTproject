import { Link } from '@inertiajs/react';

export default function Card({
    children,
    title,
    subtitle,
    header,
    footer,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    href,
    onClick,
    hoverable = false,
    bordered = true,
    shadow = 'sm',
    padding = 'p-6',
}) {
    const cardClasses = [
        'bg-white rounded-xl',
        bordered ? 'border border-gray-200' : '',
        shadow === 'sm' ? 'shadow-sm' : shadow === 'md' ? 'shadow-md' : shadow === 'lg' ? 'shadow-lg' : '',
        hoverable ? 'transition duration-200 hover:shadow-lg hover:-translate-y-1' : '',
        className,
    ].filter(Boolean).join(' ');

    const content = (
        <div className={cardClasses}>
            {/* Header */}
            {(title || subtitle || header) && (
                <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
                    {header ? (
                        header
                    ) : (
                        <>
                            {title && (
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-500">
                                    {subtitle}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Body */}
            <div className={`${padding} ${bodyClassName}`}>
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className={`px-6 py-4 border-t border-gray-200 ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );

    // If href is provided, wrap in Link
    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    // If onClick is provided, wrap in button
    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {content}
            </button>
        );
    }

    return content;
}
