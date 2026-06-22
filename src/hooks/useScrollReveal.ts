import { useEffect, useRef, useCallback } from 'react';

/**
 * Intersection Observer-based scroll reveal.
 * Attaches to a scroll container and reveals child items
 * with staggered fade-in as they enter the viewport.
 */
export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(() => {
    if (!containerRef.current) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once visible, stop observing for performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px 40px 0px',
      }
    );

    // Observe all scroll-reveal-item children
    const items = containerRef.current.querySelectorAll('.scroll-reveal-item');
    items.forEach((item) => {
      observerRef.current?.observe(item);
    });
  }, [options?.threshold, options?.rootMargin]);

  useEffect(() => {
    // Small delay to ensure DOM is ready after renders
    const raf = requestAnimationFrame(() => {
      observe();
    });

    return () => {
      cancelAnimationFrame(raf);
      observerRef.current?.disconnect();
    };
  }, [observe]);

  // Re-observe when content changes (e.g. search results)
  const refresh = useCallback(() => {
    requestAnimationFrame(() => observe());
  }, [observe]);

  return { containerRef, refresh };
}
