'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { billAnalyzer, AnalysisResult, BillData } from '@/lib/bill-analyzer';
import { useLanguage } from '@/contexts/LanguageContext';
import { OCRPreprocessor } from '@/lib/ocr-preprocessor';
import ManualDataInput from './ManualDataInput';

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function FileUpload({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [partialData, setPartialData] = useState<Partial<BillData> | null>(null);
  const { t, language } = useLanguage();

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      setCurrentStep(t.stepProcessing);
      setUploadProgress(20);

      // Preprocess image for better OCR
      const processedImageUrl = await OCRPreprocessor.preprocessImage(file);
      
      setCurrentStep(t.stepExtracting);
      setUploadProgress(40);

      // Try multiple OCR approaches
      let text = '';
      let ocrSuccess = false;

      // Attempt 1: German with preprocessing
      try {
        const result1 = await Tesseract.recognize(processedImageUrl, 'deu', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setUploadProgress(40 + (m.progress * 20));
            }
          }
        });
        text = result1.data.text;
        ocrSuccess = true;
      } catch (e) {
        console.log('German OCR failed, trying English...');
      }

      // Attempt 2: English as fallback
      if (!ocrSuccess || text.length < 50) {
        try {
          const result2 = await Tesseract.recognize(processedImageUrl, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                setUploadProgress(60 + (m.progress * 20));
              }
            }
          });
          text = result2.data.text;
          ocrSuccess = true;
        } catch (e) {
          console.log('English OCR also failed');
        }
      }

      setCurrentStep(t.stepAnalyzing);
      setUploadProgress(80);

      // Extract bill data from OCR text with improved methods
      let extractedData = await billAnalyzer.extractBillData(text);
      
      // Try enhanced extraction if initial attempt failed
      if (!extractedData.plz) {
        const plzCandidates = OCRPreprocessor.extractPLZPatterns(text);
        if (plzCandidates.length > 0) {
          extractedData.plz = plzCandidates[0];
        }
      }
      
      if (!extractedData.apartmentSize) {
        const size = OCRPreprocessor.extractApartmentSize(text);
        if (size) {
          extractedData.apartmentSize = size;
        }
      }
      
      // If still missing critical data, offer manual input
      if (!extractedData.plz || !extractedData.apartmentSize) {
        setPartialData(extractedData);
        setShowManualInput(true);
        setIsAnalyzing(false);
        return;
      }

      setCurrentStep(t.stepComparing);
      setUploadProgress(90);

      // Analyze the bill
      const result = await billAnalyzer.analyzeBill(extractedData as BillData, language);
      
      setUploadProgress(100);
      setCurrentStep(t.stepCompleted);
      
      // Clean up
      // URL.revokeObjectURL(processedImageUrl); // Don't revoke data URL
      
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

  const handleManualDataSubmit = async (data: BillData) => {
    setIsAnalyzing(true);
    setShowManualInput(false);
    setCurrentStep(t.stepAnalyzing);
    setUploadProgress(80);

    try {
      const result = await billAnalyzer.analyzeBill(data, language);
      setUploadProgress(100);
      setCurrentStep(t.stepCompleted);
      
      setTimeout(() => {
        onAnalysisComplete(result);
        setIsAnalyzing(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorAnalysisFailed);
      setIsAnalyzing(false);
    }
  };

  const handleManualCancel = () => {
    setShowManualInput(false);
    setPartialData(null);
    setError(null);
    setUploadProgress(0);
    setCurrentStep('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isAnalyzing || showManualInput
  });

  if (isAnalyzing) {
    return (
      <div className="border-2 border-blue-300 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center bg-blue-50">
        <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {t.stepAnalyzing}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 px-2">{currentStep}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-4">
          <div 
            className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500">
          {uploadProgress}% {language === 'de' ? 'abgeschlossen' : 'completed'}
        </div>
      </div>
    );
  }

  if (showManualInput) {
    return (
      <ManualDataInput
        onDataSubmit={handleManualDataSubmit}
        onCancel={handleManualCancel}
        initialData={partialData || undefined}
      />
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-300 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center bg-red-50">
        <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-600 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-red-900 mb-2">
          OCR Detection Failed
        </h3>
        <p className="text-sm sm:text-base text-red-700 mb-4 sm:mb-6 px-2">{error}</p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          <button 
            onClick={() => setShowManualInput(true)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
                         <span>{t.enterDataManually}</span>
          </button>
          <button 
            onClick={() => {
              setError(null);
              setUploadProgress(0);
              setCurrentStep('');
            }}
            className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            {t.newAnalysis}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        {isDragActive ? (
          <>
            <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto animate-bounce" />
            <div className="px-2">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900">
                {t.uploadDrop}
              </h3>
              <p className="text-sm sm:text-base text-blue-700">
                {t.uploadTitle}
              </p>
            </div>
          </>
        ) : (
          <>
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto" />
            <div className="px-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {t.uploadTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {t.uploadDrop}
              </p>
              <div className="text-xs sm:text-sm text-gray-500 mb-4">
                {t.uploadFormats} • {t.gdprCompliant}
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base">
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