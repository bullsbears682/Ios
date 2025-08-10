import { NextRequest, NextResponse } from 'next/server';
import { billAnalyzer } from '@/lib/bill-analyzer';
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, JPG, or PNG.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { error: 'Datei zu groß. Maximum 10MB erlaubt.' },
        { status: 400 }
      );
    }

    // Convert file to buffer for OCR
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Perform OCR with German language support
    const { data: { text } } = await Tesseract.recognize(buffer, 'deu', {
      logger: m => console.log(m) // Server-side logging
    });

    // Extract bill data from OCR text
    const extractedData = await billAnalyzer.extractBillData(text);
    
    // Validate required fields
    if (!extractedData.plz) {
      return NextResponse.json(
        { error: 'Postleitzahl konnte nicht erkannt werden. Bitte stellen Sie sicher, dass die Adresse deutlich lesbar ist.' },
        { status: 400 }
      );
    }

    if (!extractedData.apartmentSize) {
      return NextResponse.json(
        { error: 'Wohnungsgröße (m²) konnte nicht erkannt werden. Bitte prüfen Sie, ob diese Information im Dokument enthalten ist.' },
        { status: 400 }
      );
    }

    // Analyze the bill with real 2025 data
    const analysisResult = await billAnalyzer.analyzeBill(extractedData as any);
    
    // Log for analytics (anonymized)
    console.log(`Analysis completed for PLZ ${extractedData.plz}, City: ${analysisResult.cityInfo.city}`);

    return NextResponse.json({
      success: true,
      result: analysisResult,
      extractedData: {
        plz: extractedData.plz,
        city: analysisResult.cityInfo.city,
        apartmentSize: extractedData.apartmentSize,
        confidence: analysisResult.confidence
      }
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}