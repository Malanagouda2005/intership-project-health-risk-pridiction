import React, { useRef } from 'react';
import { FaCloudUploadAlt, FaTrashAlt, FaImage } from 'react-icons/fa';
import './ImageUpload.css';

const ImageUpload = ({ image, previewUrl, onFileSelect, onRemove }) => {
  const dropRef = useRef(null);

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className="image-upload-card"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      ref={dropRef}
    >
      <div className="upload-icon">
        <FaCloudUploadAlt />
      </div>
      <div className="upload-text">
        <h3>Upload medical image</h3>
        <p>Drag & drop JPG / PNG or click to browse</p>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        className="upload-input"
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />

      {previewUrl && (
        <div className="image-preview-block">
          <div className="preview-label">
            <FaImage />
            <span>Preview</span>
          </div>
          <div className="preview-wrapper">
            <img src={previewUrl} alt="Uploaded preview" />
            <button type="button" className="remove-image" onClick={onRemove}>
              <FaTrashAlt /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
