import { useEffect } from 'react';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Overtime Dodgeball` : 'Overtime Dodgeball';
    return () => { document.title = 'Overtime Dodgeball'; };
  }, [title]);
}
