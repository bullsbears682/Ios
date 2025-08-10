'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, FileText, Image } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileFileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function MobileFileUpload({ onFileSelect, disabled }: MobileFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Mobile Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        <button
          onClick={openCamera}
          disabled={disabled}
          className="flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        >
          <Camera className="h-6 w-6" />
          <span className="font-medium">Take Photo</span>
        </button>
        
        <button
          onClick={openFileSelector}
          disabled={disabled}
          className="flex items-center justify-center space-x-3 p-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        >
          <Upload className="h-6 w-6" />
          <span className="font-medium">Upload File</span>
        </button>
      </div>

      {/* Desktop/Tablet Drag & Drop Area */}
      <div
        className={`
          hidden md:block
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="space-y-4">
          {dragActive ? (
            <>
              <Upload className="h-16 w-16 text-blue-600 mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-semibold text-blue-900">
                  {t.uploadDrop}
                </h3>
                <p className="text-blue-700">
                  Release to upload
                </p>
              </div>
            </>
          ) : (
            <>
              <FileText className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.uploadTitle}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t.uploadDrop}
                </p>
                <div className="text-sm text-gray-500">
                  {t.uploadFormats} • {t.gdprCompliant}
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openCamera();
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={disabled}
                >
                  <Camera className="h-4 w-4" />
                  <span>Camera</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileSelector();
                  }}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">{t.supportedDocuments}</p>
        <div className="flex justify-center space-x-4 text-xs text-gray-400">
          <span className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>PDF</span>
          </span>
          <span className="flex items-center space-x-1">
            <Image className="h-3 w-3" />
            <span>JPG/PNG</span>
          </span>
          <span>Max 10MB</span>
        </div>
      </div>
    </div>
  );
}