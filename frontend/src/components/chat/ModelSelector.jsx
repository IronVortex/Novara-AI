import { PROVIDERS } from "../../constants/index.js";

function ModelSelector({ provider, model, onChange }) {
  const activeProvider = PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];

  return (
    <div className="model-selector" role="group" aria-label="Model selector">
      <select
        value={provider}
        onChange={(event) => {
          const next = PROVIDERS.find((item) => item.id === event.target.value);
          onChange({
            provider: event.target.value,
            model: next?.models?.[0] || model,
          });
        }}
        aria-label="AI provider"
      >
        {PROVIDERS.map((item) => (
          <option key={item.id} value={item.id} disabled={!item.enabled}>
            {item.label}
            {!item.enabled ? " (soon)" : ""}
          </option>
        ))}
      </select>
      <select
        value={model}
        onChange={(event) => onChange({ provider, model: event.target.value })}
        aria-label="AI model"
      >
        {(activeProvider?.models || []).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelSelector;
