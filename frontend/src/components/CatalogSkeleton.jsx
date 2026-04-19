function CatalogSkeleton({ count = 6 }) {
  return (
    <section className="section-card skeleton-shell" aria-hidden="true">
      <div className="skeleton-heading">
        <div className="skeleton-line skeleton-line--eyebrow" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--copy" />
      </div>

      <div className="category-filter-bar category-filter-bar--skeleton">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="skeleton-chip" />
        ))}
      </div>

      <div className="tattoo-grid">
        {Array.from({ length: count }).map((_, index) => (
          <article key={index} className="tattoo-card skeleton-card">
            <div className="skeleton-card__image" />
            <div className="skeleton-card__content">
              <div className="skeleton-row">
                <span className="skeleton-chip skeleton-chip--short" />
                <span className="skeleton-chip skeleton-chip--tiny" />
              </div>
              <div className="skeleton-line skeleton-line--card-title" />
              <div className="skeleton-line skeleton-line--card-copy" />
              <div className="skeleton-line skeleton-line--card-copy short" />
              <div className="skeleton-actions">
                <span className="skeleton-button" />
                <span className="skeleton-button" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CatalogSkeleton;
