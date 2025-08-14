import React, { useCallback, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from './Button';
import styles from './ImageUpload.module.css';

export interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelected,
  disabled = false,
  maxFiles = 5,
  accept = ".jpg,.jpeg,.png,.webp",
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || disabled) return;
    
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (imageFiles.length > 0) {
      const limitedFiles = imageFiles.slice(0, maxFiles);
      onImagesSelected(limitedFiles);
    }
  }, [onImagesSelected, disabled, maxFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsDragging(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  return (
    <>
      <input
        type="file"
        id="image-upload"
        multiple
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className={styles.hiddenInput}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => document.getElementById('image-upload')?.click()}
        className={styles.uploadButton}
        title="Upload images"
      >
        <Camera size={18} />
      </Button>
      
      {/* Invisible drop zone overlay */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className={styles.dropIndicator}>
            <Upload size={32} />
            <span>Drop images here</span>
          </div>
        )}
      </div>
    </>
  );
};