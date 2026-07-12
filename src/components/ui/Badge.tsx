import { FREQUENCY_STYLES, DIFFICULTY_STYLES } from '@/lib/constants';

export default function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'frequency' | 'difficulty' | 'default';
}) {
  let className = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ';
  
  if (variant === 'frequency') {
    className += FREQUENCY_STYLES[children as string] || FREQUENCY_STYLES['中频'];
  } else if (variant === 'difficulty') {
    className += DIFFICULTY_STYLES[children as string] || 'bg-gray-100 text-gray-600';
  } else {
    className += 'bg-slate-100 text-slate-600 border border-slate-200';
  }
  
  return <span className={className}>{children}</span>;
}
