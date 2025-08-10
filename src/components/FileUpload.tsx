'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { billAnalyzer, AnalysisResult, BillData } from '@/lib/bill-analyzer';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function FileUpload({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      setCurrentStep(t.stepProcessing);
      setUploadProgress(20);

      // Convert file to image for OCR
      const imageUrl = URL.createObjectURL(file);
      
      setCurrentStep(t.stepExtracting);
      setUploadProgress(40);

      // OCR processing with German language support
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'deu', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setUploadProgress(40 + (m.progress * 40));
          }
        }
      });

      setCurrentStep(t.stepAnalyzing);
      setUploadProgress(80);

      // Extract bill data from OCR text
      const extractedData = await billAnalyzer.extractBillData(text);
      
      // Validate extracted data
      if (!extractedData.plz) {
        throw new Error(t.errorPLZNotFound);
      }

      if (!extractedData.apartmentSize) {
        throw new Error(t.errorApartmentSize);
      }

      setCurrentStep(t.stepComparing);
      setUploadProgress(90);

      // Analyze the bill
      const result = await billAnalyzer.analyzeBill(extractedData as BillData, language);
      
      setUploadProgress(100);
      setCurrentStep(t.stepCompleted);
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      
      setTimeout(() => {
        onAnalysisComplete(result);
      }, 500);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isAnalyzing
  });

  if (isAnalyzing) {
    return (
      <div className="border-2 border-blue-300 border-dashed rounded-xl p-12 text-center bg-blue-50">
        <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t.stepAnalyzing}
        </h3>
        <p className="text-gray-600 mb-4">{currentStep}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-500">
          {uploadProgress}% abgeschlossen
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-300 border-dashed rounded-xl p-12 text-center bg-red-50">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-900 mb-2">
          {t.errorAnalysisFailed}
        </h3>
        <p className="text-red-700 mb-6">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setUploadProgress(0);
            setCurrentStep('');
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t.newAnalysis}
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        {isDragActive ? (
          <>
            <Upload className="h-16 w-16 text-blue-600 mx-auto animate-bounce" />
            <div>
              <h3 className="text-xl font-semibold text-blue-900">
                {t.uploadDrop}
              </h3>
              <p className="text-blue-700">
                {t.uploadTitle}
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
            
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t.uploadButton}
            </button>
          </>
        )}
      </div>
      
      {/* Example formats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">{t.supportedDocuments}</p>
        <div className="flex justify-center space-x-6 text-xs text-gray-400">
          <span>✓ Betriebskostenabrechnung</span>
          <span>✓ Heizkostenabrechnung</span>
          <span>✓ Nebenkostenabrechnung</span>
        </div>
      </div>
    </div>
  );
}