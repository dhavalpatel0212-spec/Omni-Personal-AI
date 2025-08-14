import React, { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { useAnalyzeShoppingImage } from '../helpers/useShopping';
import { AnalyzedItem } from '../endpoints/ai/analyze_shopping_image_POST.schema';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  onItemsAnalyzed: (items: AnalyzedItem[]) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onItemsAnalyzed, className }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const analyzeImageMutation = useAnalyzeShoppingImage();

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    analyzeImageMutation.mutate(formData, {
      onSuccess: (data) => {
        if ('items' in data) {
          onItemsAnalyzed(data.items);
        }
        setSelectedFile(null);
        setPreview(null);
      },
    });
  };

  if (analyzeImageMutation.isPending) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <Skeleton style={{ height: '200px', width: '100%' }} />
        <p className={styles.processingText}>Analyzing image, please wait...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {!selectedFile ? (
        <FileDropzone
          onFilesSelected={handleFileSelect}
          accept="image/png, image/jpeg, image/webp"
          maxFiles={1}
          title="Upload a photo of your list"
          subtitle="We'll scan it for items."
        />
      ) : (
        <div className={styles.previewContainer}>
          {preview && <img src={preview} alt="Preview" className={styles.previewImage} />}
          <div className={styles.previewActions}>
            <Button onClick={handleAnalyze}>Analyze Image</Button>
            <Button variant="outline" onClick={() => { setSelectedFile(null); setPreview(null); }}>
              Choose another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};