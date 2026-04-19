import { useEffect, useRef, useState } from 'react';

function RevealSection({
  as: Tag = 'section',
  className = '',
  delay = 0,
  threshold = 0.14,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={['reveal-section', isVisible ? 'is-visible' : '', className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default RevealSection;
