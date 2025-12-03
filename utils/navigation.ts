import { useRouter } from 'next/navigation';

/**
 * Custom hook for navigation that works with both Next.js and manual routing
 */
export function useNavigation() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    // Update URL in browser
    router.push(path);
  };

  return { navigateTo };
}
