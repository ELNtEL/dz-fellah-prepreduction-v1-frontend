import { useRef, useState } from 'react';
import { FiImage, FiPlus } from 'react-icons/fi';
import './css-weekly/UploadBox.css';

function UploadBox({ onFileSelect, previewUrl, title = "Upload BASKET photo" }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onFileSelect(file);
        }
    };

    return (
        <div
            className={`upload-box ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {previewUrl ? (
                <div className="upload-preview">
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    <button className="change-image-btn" onClick={handleClick}>
                        Change Image
                    </button>
                </div>
            ) : (
                <div className="upload-content">
                    <div className="upload-icon-container">
                        <FiImage className="upload-icon" />
                        <div className="upload-plus">
                            <FiPlus />
                        </div>
                    </div>

                    <h3 className="upload-title">{title}</h3>
                    <p className="upload-hint">Drag and drop or click to upload. (Optional)</p>

                    <button className="upload-btn" onClick={handleClick}>
                        Choose file
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
            />
        </div>
    );
}

export default UploadBox;
