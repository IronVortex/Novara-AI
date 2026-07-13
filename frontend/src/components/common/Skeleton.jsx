function Skeleton({ lines = 3, className = "" }) {
  return (
    <div className={`skeleton-stack ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton-line" style={{ width: `${90 - index * 12}%` }} />
      ))}
    </div>
  );
}

export default Skeleton;
