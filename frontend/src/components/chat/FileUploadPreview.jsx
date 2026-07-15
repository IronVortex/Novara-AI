import { IconX } from '../common/Icons.jsx';

const FILE_ICONS = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'text/plain': '📃',
  'text/csv': '📊',
  'application/json': '🗂️',
  'text/markdown': '📋',
};

function getFileIcon(mimeType = '') {
  if (FILE_ICONS[mimeType]) return FILE_ICONS[mimeType];
  if (mimeType.startsWith('image/')) return '🖼️';
  return '📁';
}

function FileUploadPreview({ files = [], uploading = [], onRemove }) {
  if (!files.length && !uploading.length) return null;

  return (
    <div className="file-preview-row" role="list" aria-label="Attached files">
      {uploading.map((f, i) => (
        <div key={`up-${i}`} className="file-chip uploading" role="listitem">
          <span className="file-chip-icon">⏳</span>
          <span className="file-chip-name">{f.name}</span>
          <span className="file-chip-progress">
            <span className="file-progress-bar" />
          </span>
        </div>
      ))}
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} className="file-chip" role="listitem">
          <span className="file-chip-icon">{getFileIcon(f.mimeType)}</span>
          <span className="file-chip-name">{f.name}</span>
          {onRemove && (
            <button
              className="file-chip-remove"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${f.name}`}
              type="button"
            >
              <IconX size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default FileUploadPreview;
