import { useEffect, useState } from 'react';

function LazyImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackLabel = 'Imagen no disponible',
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const wrapperClasses = ['lazy-image', wrapperClassName, isLoaded ? 'is-loaded' : '', hasError ? 'has-error' : '']
    .filter(Boolean)
    .join(' ');
  const showFallback = !src || hasError;

  return (
    <div className={wrapperClasses}>
      {!showFallback ? <div className="lazy-image__placeholder" aria-hidden="true" /> : null}

      {showFallback ? (
        <div className="lazy-image__fallback" role="img" aria-label={alt}>
          <span>{fallbackLabel}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          decoding={decoding}
          onLoad={(event) => {
            setIsLoaded(true);
            onLoad?.(event);
          }}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
          {...rest}
        />
      )}
    </div>
  );
}

export default LazyImage;
