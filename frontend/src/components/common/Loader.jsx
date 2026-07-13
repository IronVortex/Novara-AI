import { ScaleLoader } from "react-spinners";

function Loader({ loading, label = "Thinking..." }) {
  if (!loading) return null;

  return (
    <div className="loader-stack" aria-live="polite">
      <ScaleLoader color="#8B5CF6" loading={loading} />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
