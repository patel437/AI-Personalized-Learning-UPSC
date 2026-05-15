import { useEffect, useRef } from 'react';

export const usePerformanceMonitoring = (componentName) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    // Log mount time
    const mountTime = performance.now() - startTime.current;
    if (mountTime > 100) {
      console.warn(`${componentName} took ${mountTime.toFixed(2)}ms to mount`);
    }

    // Report to analytics
    if (window.gtag) {
      window.gtag('event', 'component_performance', {
        component: componentName,
        mount_time: mountTime
      });
    }

    return () => {
      const unmountTime = performance.now() - startTime.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} unmounted after ${unmountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Image lazy loading hook
export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px', ...options }
    );

    const element = document.getElementById(`lazy-img-${src}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [src, options]);

  return { imageSrc, isLoaded, setIsLoaded };
};
