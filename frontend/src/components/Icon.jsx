export default function Icon({ children, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
