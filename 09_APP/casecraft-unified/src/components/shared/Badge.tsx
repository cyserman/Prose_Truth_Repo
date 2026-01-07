/**
 * Badge Component - Used for tags, status indicators, etc.
 */

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-gray-200 text-gray-900 border-gray-300',
        primary: 'bg-truth-primary text-white border-truth-primary',
        success: 'bg-green-600 text-white border-green-700',
        warning: 'bg-amber-600 text-white border-amber-700',
        danger: 'bg-red-600 text-white border-red-700',
        info: 'bg-blue-600 text-white border-blue-700',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
