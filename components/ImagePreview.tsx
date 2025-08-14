import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './ImagePreview.module.css';

export interface ImagePreviewProps {
  file: File;
  dataUrl: string;
  onRemove: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  dataUrl,
  onRemove,
  size = 'md',
}) => {
  return (
    <div className={`${styles.preview} ${styles[size]}`}>
      <img
        src={dataUrl}
        alt={file.name}
        className={styles.image}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        onClick={onRemove}
        className={styles.removeButton}
        title="Remove image"
      >
        <X size={12} />
      </Button>
      <div className={styles.filename}>
        {file.name}
      </div>
    </div>
  );
};