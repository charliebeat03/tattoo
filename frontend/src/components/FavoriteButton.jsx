function FavoriteButton({ active, onClick, compact = false, className = '' }) {
  const classes = ['favorite-button', active ? 'is-active' : '', compact ? 'favorite-button--compact' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={onClick}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
    </button>
  );
}

export default FavoriteButton;
