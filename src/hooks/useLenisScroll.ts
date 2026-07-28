import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function useLenisScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lenis = new Lenis({
      wrapper: el,
      content: el,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return { ref, lenis: lenisRef };
}
