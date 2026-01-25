import { useRef, useState } from 'react';
import { FiImage, FiPlus } from 'react-icons/fi';
import './css-weekly/UploadBox.css';

function UploadBox({ onFileSelect, previewUrl, title = "Upload BASKET photo" }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = (e) => {
        // Prevent event from bubbling up to form and triggering submit
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset the input so the same file can be selected again if needed
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onFileSelect(file);
        }
    };

    // Handle click on the upload box container
    const handleBoxClick = (e) => {
        // Prevent event from bubbling up to form
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`upload-box ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {previewUrl ? (
                <div className="upload-preview" onClick={(e) => e.stopPropagation()}>
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    <button
                        type="button"
                        className="change-image-btn"
                        onClick={handleClick}
                    >
                        Change Image
                    </button>
                </div>
            ) : (
                <div className="upload-content" onClick={(e) => e.stopPropagation()}>
                    <div className="upload-icon-container">
                        <FiImage className="upload-icon" />
                        <div className="upload-plus">
                            <FiPlus />
                        </div>
                    </div>

                    <h3 className="upload-title">{title}</h3>
                    <p className="upload-hint">Drag and drop or click to upload. (Optional)</p>

                    <button
                        type="button"
                        className="upload-btn"
                        onClick={handleClick}
                    >
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
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export default UploadBox;
