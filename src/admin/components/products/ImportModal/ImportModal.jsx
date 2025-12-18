// src/components/products/ImportModal/ImportModal.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Check, FileJson } from 'lucide-react';
import { adminProducts } from '../../../utils/firebase/adminConfig';
import styles from './ImportModal.module.css';

const ImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({
    title: 'name',
    description: 'description',
    price: 'price',
    stock: 'stock',
    category: 'category',
    images: 'images',
    featured: 'isHighlight',
    trending: 'isBestseller',
    productTypes: 'tags',
    subcategory: 'subcategory'
  });
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    } else {
      alert('Please upload a JSON file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a JSON file first');
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = e.target.result;
          
          // Simulate progress
          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 90) {
                clearInterval(interval);
                return prev;
              }
              return prev + 10;
            });
          }, 200);
          
          const importResult = await adminProducts.importProducts(jsonData, fieldMapping);
          
          clearInterval(interval);
          setProgress(100);
          setResult(importResult);
          
          // Notify parent component
          if (onImportComplete) {
            onImportComplete(importResult);
          }
          
        } catch (error) {
          console.error('Import failed:', error);
          setResult({
            success: false,
            error: error.message || 'Import failed'
          });
        } finally {
          setImporting(false);
        }
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('File reading error:', error);
      setImporting(false);
      setResult({
        success: false,
        error: 'Failed to read file'
      });
    }
  };

  const updateFieldMapping = (oldField, newField) => {
    setFieldMapping(prev => ({
      ...prev,
      [oldField]: newField
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FileJson size={24} />
            Import Products from JSON
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* File Upload Section */}
          <div className={styles.uploadSection}>
            <h3 className={styles.sectionTitle}>Upload JSON File</h3>
            
            <div 
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              
              {file ? (
                <div className={styles.fileInfo}>
                  <FileJson size={48} />
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{fileName}</span>
                    <span className={styles.fileSize}>
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button 
                    className={styles.removeFileButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileName('');
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <Upload size={48} />
                  <p className={styles.dropText}>
                    Drag & drop your JSON file here
                  </p>
                  <p className={styles.dropSubtext}>
                    or click to browse files
                  </p>
                </div>
              )}
            </div>
            
            {file && (
              <div className={styles.filePreviewNote}>
                <AlertCircle size={16} />
                <span>File ready for import. Check field mappings below.</span>
              </div>
            )}
          </div>

          {/* Field Mapping Section */}
          <div className={styles.mappingSection}>
            <h3 className={styles.sectionTitle}>Field Mapping</h3>
            <p className={styles.mappingDescription}>
              Map your JSON fields to your database fields
            </p>
            
            <div className={styles.mappingTable}>
              <div className={styles.mappingHeader}>
                <span className={styles.headerCell}>JSON Field</span>
                <span className={styles.headerCell}>Your Database Field</span>
              </div>
              
              {Object.entries(fieldMapping).map(([oldField, newField]) => (
                <div key={oldField} className={styles.mappingRow}>
                  <div className={styles.fieldName}>
                    <code>{oldField}</code>
                    <span className={styles.fieldExample}>
                      {oldField === 'title' && ' (e.g., "Some Facets of Indian Knowledge Systems")'}
                      {oldField === 'productTypes' && ' (array → tags)'}
                    </span>
                  </div>
                  <div className={styles.fieldMapping}>
                    <span className={styles.mappingArrow}>→</span>
                    <select 
                      value={newField}
                      onChange={(e) => updateFieldMapping(oldField, e.target.value)}
                      className={styles.fieldSelect}
                    >
                      <option value="name">Product Name</option>
                      <option value="description">Description</option>
                      <option value="price">Price</option>
                      <option value="stock">Stock</option>
                      <option value="category">Category</option>
                      <option value="subcategory">Subcategory</option>
                      <option value="images">Images</option>
                      <option value="rating">Rating</option>
                      <option value="isHighlight">Is Highlight</option>
                      <option value="isBestseller">Is Bestseller</option>
                      <option value="tags">Tags</option>
                      <option value="author">Author</option>
                      <option value="isActive">Is Active</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress and Results */}
          {(importing || result) && (
            <div className={styles.resultsSection}>
              {importing && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    Importing... {progress}%
                  </span>
                </div>
              )}
              
              {result && (
                <div className={`${styles.resultMessage} ${result.success ? styles.success : styles.error}`}>
                  {result.success ? (
                    <>
                      <Check size={24} />
                      <div className={styles.resultDetails}>
                        <h4>Import Successful!</h4>
                        <p>
                          Imported: <strong>{result.imported}</strong> products<br />
                          Skipped: <strong>{result.skipped}</strong> products<br />
                          Total processed: <strong>{result.total}</strong>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={24} />
                      <div className={styles.resultDetails}>
                        <h4>Import Failed</h4>
                        <p>{result.error || 'Unknown error occurred'}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={!file || importing}
            className={styles.importButton}
          >
            {importing ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;