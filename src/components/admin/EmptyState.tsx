'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        {icon && <div className="flex justify-center mb-4 text-gray-300">{icon}</div>}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-500 max-w-sm mx-auto">{description}</p>}
      </div>
    </div>
  );
}
