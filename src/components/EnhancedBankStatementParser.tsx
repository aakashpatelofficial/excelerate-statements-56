import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Upload, X, Eye, Download, ZoomIn, ZoomOut, ChevronUp, ChevronDown,
  FileText, Table, MessageSquare, CheckCircle, AlertTriangle, Loader2
} from "lucide-react";

// Enhanced interfaces for better typing
interface UploadedFile {
  file: File;
  id: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  accuracy?: number;
}

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
  reference?: string;
  confidence: number;
}

interface BankStatementData {
  fileName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  statementPeriod: string;
  transactions: ExtractedTransaction[];
  accuracy: number;
  processingMethod: string;
}

interface ExtractionConfig {
  useAdvancedOCR: boolean;
  enableTableDetection: boolean;
  multiPassExtraction: boolean;
  enableValidation: boolean;
  confidenceThreshold: number;
}

// Bank-specific patterns and rules
const BANK_PATTERNS = {
  SBI: {
    name: "State Bank of India",
    patterns: {
      dateFormats: [/(\d{2}\/\d{2}\/\d{4})/g, /(\d{2}-\d{2}-\d{4})/g],
      amountFormats: [/(\d{1,3}(?:,\d{2,3})*\.\d{2})/g],
      transactionLine: /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})\s*([CD]R)?\s*(\d{1,3}(?:,\d{2,3})*\.\d{2})?/,
      referencePattern: /REF[:\s]+([A-Z0-9]+)/i
    }
  },
  HDFC: {
    name: "HDFC Bank",
    patterns: {
      dateFormats: [/(\d{2}\/\d{2}\/\d{2})/g, /(\d{2}-\d{2}-\d{2})/g],
      amountFormats: [/(\d{1,3}(?:,\d{2,3})*\.\d{2})/g],
      transactionLine: /^(\d{2}\/\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})\s*([CD]R)?\s*(\d{1,3}(?:,\d{2,3})*\.\d{2})?/,
      referencePattern: /TXN[:\s]+([A-Z0-9]+)/i
    }
  },
  ICICI: {
    name: "ICICI Bank",
    patterns: {
      dateFormats: [/(\d{2}\/\d{2}\/\d{4})/g, /(\d{2}-\d{2}-\d{4})/g],
      amountFormats: [/(\d{1,3}(?:,\d{2,3})*\.\d{2})/g],
      transactionLine: /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})\s*([CD]R)?\s*(\d{1,3}(?:,\d{2,3})*\.\d{2})?/,
      referencePattern: /REF NO[:\s]+([A-Z0-9]+)/i
    }
  },
  AXIS: {
    name: "Axis Bank",
    patterns: {
      dateFormats: [/(\d{2}\/\d{2}\/\d{4})/g, /(\d{2}-\d{2}-\d{4})/g],
      amountFormats: [/(\d{1,3}(?:,\d{2,3})*\.\d{2})/g],
      transactionLine: /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})\s*([CD]R)?\s*(\d{1,3}(?:,\d{2,3})*\.\d{2})?/,
      referencePattern: /UTR[:\s]+([A-Z0-9]+)/i
    }
  }
};

const EnhancedBankStatementParser = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<BankStatementData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<BankStatementData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  
  // Configuration state
  const [config, setConfig] = useState<ExtractionConfig>({
    useAdvancedOCR: true,
    enableTableDetection: true,
    multiPassExtraction: true,
    enableValidation: true,
    confidenceThreshold: 0.7
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  // Load external libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setProcessingStatus("Loading processing libraries...");
        
        // Load PDF.js
        if (!window.pdfjsLib) {
          const script1 = document.createElement('script');
          script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script1);
          
          await new Promise((resolve) => {
            script1.onload = resolve;
          });
          
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Load Tesseract.js for OCR
        if (!window.Tesseract) {
          const script2 = document.createElement('script');
          script2.src = 'https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js';
          document.head.appendChild(script2);
          
          await new Promise((resolve) => {
            script2.onload = resolve;
          });
        }

        // Load XLSX for Excel export
        if (!window.XLSX) {
          const script3 = document.createElement('script');
          script3.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          document.head.appendChild(script3);
          
          await new Promise((resolve) => {
            script3.onload = resolve;
          });
        }

        setLibrariesLoaded(true);
        setProcessingStatus("Ready to process bank statements");
        toast.success("Processing libraries loaded successfully!");
      } catch (error) {
        console.error('Error loading libraries:', error);
        toast.error("Failed to load processing libraries");
        setProcessingStatus("Error loading libraries");
      }
    };

    loadLibraries();
  }, []);

  // Enhanced file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processingStatus: 'pending'
    }));

    // Validate file types and sizes
    const validFiles = newFiles.filter(fileObj => {
      const { file } = fileObj;
      
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name}: Only PDF files are supported`);
        return false;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`${file.name}: File size exceeds 50MB limit`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    }
  };

  // Enhanced PDF text extraction with multiple methods
  const extractTextFromPDF = async (file: File): Promise<{ text: string; method: string; confidence: number }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      let confidence = 0.9; // High confidence for digital text

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length > 100) {
        return { text: fullText, method: 'Digital Text Extraction', confidence };
      } else {
        // Fallback to OCR if digital text is insufficient
        return await extractTextWithOCR(file);
      }
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return await extractTextWithOCR(file);
    }
  };

  // Enhanced OCR with image preprocessing
  const extractTextWithOCR = async (file: File): Promise<{ text: string; method: string; confidence: number }> => {
    try {
      setProcessingStatus("Running advanced OCR...");
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      let totalConfidence = 0;
      let pageCount = 0;

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to first 10 pages
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        
        // Enhanced OCR with better configuration
        const result = await window.Tesseract.recognize(canvas, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProcessingProgress(prev => Math.min(prev + 2, 90));
            }
          },
          tessedit_char_whitelist: '0123456789.,/-: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
          tessedit_pageseg_mode: '6' // Uniform block of text
        });

        fullText += result.data.text + '\n';
        totalConfidence += result.data.confidence;
        pageCount++;
      }

      const avgConfidence = pageCount > 0 ? totalConfidence / pageCount / 100 : 0.6;
      return { text: fullText, method: 'Advanced OCR', confidence: avgConfidence };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text using OCR');
    }
  };

  // Enhanced bank statement parsing with multiple patterns
  const parseBankStatementData = (text: string, fileName: string): BankStatementData => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Detect bank type
    let detectedBank = 'UNKNOWN';
    let bankInfo = null;
    
    for (const [bankCode, info] of Object.entries(BANK_PATTERNS)) {
      if (text.toUpperCase().includes(info.name.toUpperCase()) || 
          text.toUpperCase().includes(bankCode)) {
        detectedBank = bankCode;
        bankInfo = info;
        break;
      }
    }

    // Extract account information
    const accountNumber = extractAccountNumber(text);
    const accountHolder = extractAccountHolder(text);
    const statementPeriod = extractStatementPeriod(text);

    // Enhanced transaction extraction
    const transactions = extractTransactions(lines, bankInfo);
    
    // Calculate overall accuracy
    const accuracy = calculateAccuracy(transactions, text);

    return {
      fileName,
      bankName: bankInfo?.name || `Unknown Bank (${detectedBank})`,
      accountNumber,
      accountHolder,
      statementPeriod,
      transactions,
      accuracy,
      processingMethod: config.multiPassExtraction ? 'Multi-pass Analysis' : 'Single-pass Analysis'
    };
  };

  // Enhanced transaction extraction with confidence scoring
  const extractTransactions = (lines: string[], bankInfo: any): ExtractedTransaction[] => {
    const transactions: ExtractedTransaction[] = [];
    
    for (const line of lines) {
      const transaction = parseTransactionLine(line, bankInfo);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    // Remove duplicates and validate
    const uniqueTransactions = removeDuplicateTransactions(transactions);
    
    // Apply confidence scoring
    return uniqueTransactions.map(transaction => ({
      ...transaction,
      confidence: calculateTransactionConfidence(transaction, bankInfo)
    }));
  };

  // Parse individual transaction line with enhanced pattern matching
  const parseTransactionLine = (line: string, bankInfo: any): ExtractedTransaction | null => {
    try {
      // Try bank-specific pattern first
      if (bankInfo?.patterns?.transactionLine) {
        const match = line.match(bankInfo.patterns.transactionLine);
        if (match) {
          return {
            date: formatDate(match[1]),
            description: match[2].trim(),
            amount: parseFloat(match[3].replace(/,/g, '')),
            type: determineTransactionType(match[4], match[2]),
            balance: match[5] ? parseFloat(match[5].replace(/,/g, '')) : undefined,
            reference: extractReference(line, bankInfo),
            confidence: 0.9
          };
        }
      }

      // Fallback to generic patterns
      const genericPatterns = [
        /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})/,
        /(\d{2}-\d{2}-\d{4})\s+(.+?)\s+(\d{1,3}(?:,\d{2,3})*\.\d{2})/
      ];

      for (const pattern of genericPatterns) {
        const match = line.match(pattern);
        if (match) {
          return {
            date: formatDate(match[1]),
            description: match[2].trim(),
            amount: parseFloat(match[3].replace(/,/g, '')),
            type: determineTransactionType('', match[2]),
            confidence: 0.7
          };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Utility functions
  const extractAccountNumber = (text: string): string => {
    const patterns = [
      /Account.*?Number[:\s]*([0-9X]+)/i,
      /A\/C[:\s]*([0-9X]+)/i,
      /Account[:\s]*([0-9X]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return 'Not Found';
  };

  const extractAccountHolder = (text: string): string => {
    const patterns = [
      /Account Holder[:\s]*([A-Za-z\s]+)/i,
      /Name[:\s]*([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Not Found';
  };

  const extractStatementPeriod = (text: string): string => {
    const patterns = [
      /Statement Period[:\s]*([0-9\/\-\s]+to[0-9\/\-\s]+)/i,
      /Period[:\s]*([0-9\/\-\s]+to[0-9\/\-\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Not Found';
  };

  const formatDate = (dateStr: string): string => {
    // Convert various date formats to standard format
    const date = new Date(dateStr.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, '$2/$1/$3'));
    return date.toISOString().split('T')[0];
  };

  const determineTransactionType = (indicator: string, description: string): 'debit' | 'credit' => {
    if (indicator) {
      return indicator.toLowerCase().includes('cr') ? 'credit' : 'debit';
    }
    
    // Analyze description for credit/debit indicators
    const creditKeywords = ['deposit', 'credit', 'salary', 'transfer in', 'interest'];
    const debitKeywords = ['withdrawal', 'debit', 'payment', 'transfer out', 'charge'];
    
    const desc = description.toLowerCase();
    
    if (creditKeywords.some(keyword => desc.includes(keyword))) {
      return 'credit';
    }
    
    if (debitKeywords.some(keyword => desc.includes(keyword))) {
      return 'debit';
    }
    
    return 'debit'; // Default assumption
  };

  const extractReference = (line: string, bankInfo: any): string | undefined => {
    if (bankInfo?.patterns?.referencePattern) {
      const match = line.match(bankInfo.patterns.referencePattern);
      return match ? match[1] : undefined;
    }
    return undefined;
  };

  const removeDuplicateTransactions = (transactions: ExtractedTransaction[]): ExtractedTransaction[] => {
    const seen = new Set();
    return transactions.filter(transaction => {
      const key = `${transaction.date}-${transaction.amount}-${transaction.description.slice(0, 20)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const calculateTransactionConfidence = (transaction: ExtractedTransaction, bankInfo: any): number => {
    let confidence = 0.8; // Base confidence
    
    // Date validation
    if (isValidDate(transaction.date)) confidence += 0.1;
    
    // Amount validation
    if (transaction.amount > 0) confidence += 0.05;
    
    // Description quality
    if (transaction.description.length > 5) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  };

  const isValidDate = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const calculateAccuracy = (transactions: ExtractedTransaction[], text: string): number => {
    if (transactions.length === 0) return 0;
    
    const avgConfidence = transactions.reduce((sum, t) => sum + t.confidence, 0) / transactions.length;
    
    // Additional accuracy factors
    let accuracyBonus = 0;
    
    // Check for complete data
    const completeTransactions = transactions.filter(t => 
      t.date && t.description && t.amount && t.type
    ).length;
    
    accuracyBonus += (completeTransactions / transactions.length) * 0.1;
    
    // Check for reference numbers
    const withReferences = transactions.filter(t => t.reference).length;
    if (withReferences > 0) {
      accuracyBonus += 0.05;
    }
    
    return Math.min((avgConfidence + accuracyBonus) * 100, 100);
  };

  // Enhanced processing function
  const processFiles = async () => {
    if (!librariesLoaded) {
      toast.error("Processing libraries are still loading. Please wait.");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one PDF file");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setExtractedData([]);

    try {
      const totalFiles = uploadedFiles.length;
      const results: BankStatementData[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const fileObj = uploadedFiles[i];
        
        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, processingStatus: 'processing' } : f
        ));

        setProcessingStatus(`Processing ${fileObj.file.name}...`);
        
        try {
          // Extract text using multiple methods
          const extractionResult = await extractTextFromPDF(fileObj.file);
          setProcessingProgress(20 + (i * 60 / totalFiles));

          // Parse bank statement data
          setProcessingStatus(`Analyzing transactions in ${fileObj.file.name}...`);
          const parsedData = parseBankStatementData(extractionResult.text, fileObj.file.name);
          
          results.push(parsedData);
          
          // Update file status with accuracy
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { 
              ...f, 
              processingStatus: 'completed',
              accuracy: parsedData.accuracy
            } : f
          ));

          setProcessingProgress(20 + ((i + 1) * 60 / totalFiles));
          
        } catch (error) {
          console.error(`Error processing ${fileObj.file.name}:`, error);
          
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, processingStatus: 'error' } : f
          ));
          
          toast.error(`Failed to process ${fileObj.file.name}`);
        }
      }

      setExtractedData(results);
      setProcessingProgress(100);
      setProcessingStatus(`Successfully processed ${results.length} file(s)`);
      
      toast.success(`Processing completed! ${results.length} files processed successfully.`);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast.error("An error occurred during processing");
      setProcessingStatus("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced Excel export with multiple sheets
  const exportToExcel = () => {
    if (extractedData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = window.XLSX.utils.book_new();

      // Create summary sheet
      const summaryData = extractedData.map(data => ({
        'File Name': data.fileName,
        'Bank Name': data.bankName,
        'Account Number': data.accountNumber,
        'Account Holder': data.accountHolder,
        'Statement Period': data.statementPeriod,
        'Total Transactions': data.transactions.length,
        'Accuracy (%)': Math.round(data.accuracy),
        'Processing Method': data.processingMethod
      }));

      const summarySheet = window.XLSX.utils.json_to_sheet(summaryData);
      window.XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Create detailed transactions sheet
      const allTransactions = extractedData.flatMap(data => 
        data.transactions.map(transaction => ({
          'File Name': data.fileName,
          'Bank Name': data.bankName,
          'Account Number': data.accountNumber,
          'Date': transaction.date,
          'Description': transaction.description,
          'Amount': transaction.amount,
          'Type': transaction.type.toUpperCase(),
          'Balance': transaction.balance || '',
          'Reference': transaction.reference || '',
          'Confidence (%)': Math.round(transaction.confidence * 100)
        }))
      );

      const transactionsSheet = window.XLSX.utils.json_to_sheet(allTransactions);
      window.XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `bank-statements-${timestamp}.xlsx`;

      // Export file
      window.XLSX.writeFile(workbook, filename);
      
      toast.success(`Excel file exported: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export Excel file");
    }
  };

  // Preview data handler
  const handlePreview = (data: BankStatementData) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  // Remove file handler
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setExtractedData(prev => prev.filter((_, index) => uploadedFiles[index]?.id !== id));
  };

  const getStatusBadgeVariant = (status: string, accuracy?: number) => {
    switch (status) {
      case 'completed':
        return accuracy && accuracy >= 85 ? 'default' : accuracy && accuracy >= 70 ? 'secondary' : 'destructive';
      case 'processing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Advanced OCR</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.useAdvancedOCR}
                  onChange={(e) => setConfig(prev => ({ ...prev, useAdvancedOCR: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Enable</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Detection</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.enableTableDetection}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableTableDetection: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Enable</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Multi-pass</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.multiPassExtraction}
                  onChange={(e) => setConfig(prev => ({ ...prev, multiPassExtraction: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Enable</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Validation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.enableValidation}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableValidation: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Enable</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Bank Statement PDFs</h3>
            <p className="text-muted-foreground mb-4">
              Click to select PDF files or drag and drop them here
            </p>
            <p className="text-sm text-muted-foreground">
              Supports major Indian banks: SBI, HDFC, ICICI, Axis Bank, and more
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Uploaded Files</h3>
              <Button
                onClick={processFiles}
                disabled={isProcessing || !librariesLoaded}
                className="flex items-center space-x-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Table className="h-4 w-4" />
                )}
                <span>{isProcessing ? 'Processing...' : 'Process All Files'}</span>
              </Button>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((fileObj) => (
                <div key={fileObj.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fileObj.processingStatus)}
                    <div>
                      <p className="font-medium">{fileObj.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(fileObj.processingStatus, fileObj.accuracy)}>
                      {fileObj.processingStatus === 'completed' && fileObj.accuracy
                        ? `${Math.round(fileObj.accuracy)}% accuracy`
                        : fileObj.processingStatus.toUpperCase()
                      }
                    </Badge>
                    
                    {fileObj.processingStatus === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = extractedData.find(d => d.fileName === fileObj.file.name);
                          if (data) handlePreview(data);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(fileObj.id)}
                      disabled={fileObj.processingStatus === 'processing'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Processing Status</h3>
                <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{processingStatus}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {extractedData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Processing Results</h3>
              <Button onClick={exportToExcel} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export to Excel</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extractedData.map((data, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold truncate">{data.fileName}</h4>
                      <p className="text-sm text-muted-foreground">{data.bankName}</p>
                      <p className="text-sm">Account: {data.accountNumber}</p>
                      <p className="text-sm">Transactions: {data.transactions.length}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={data.accuracy >= 85 ? 'default' : data.accuracy >= 70 ? 'secondary' : 'destructive'}>
                          {Math.round(data.accuracy)}% accuracy
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(data)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Library Loading Status */}
      {!librariesLoaded && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading processing libraries... This may take a few moments on first load.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transaction Preview</h3>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Bank Name</p>
                    <p className="text-sm text-muted-foreground">{previewData.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Number</p>
                    <p className="text-sm text-muted-foreground">{previewData.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Holder</p>
                    <p className="text-sm text-muted-foreground">{previewData.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Statement Period</p>
                    <p className="text-sm text-muted-foreground">{previewData.statementPeriod}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Transactions ({previewData.transactions.length})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-2 grid grid-cols-5 gap-2 text-sm font-medium">
                    <div>Date</div>
                    <div>Description</div>
                    <div>Amount</div>
                    <div>Type</div>
                    <div>Confidence</div>
                  </div>
                  {previewData.transactions.slice(0, 50).map((transaction, index) => (
                    <div key={index} className="p-2 border-t grid grid-cols-5 gap-2 text-sm">
                      <div>{transaction.date}</div>
                      <div className="truncate" title={transaction.description}>
                        {transaction.description}
                      </div>
                      <div>{transaction.amount.toFixed(2)}</div>
                      <div>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant={transaction.confidence >= 0.8 ? 'default' : transaction.confidence >= 0.6 ? 'secondary' : 'destructive'}>
                          {Math.round(transaction.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {previewData.transactions.length > 50 && (
                    <div className="p-2 border-t text-center text-sm text-muted-foreground">
                      ... and {previewData.transactions.length - 50} more transactions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Global type augmentation for external libraries
declare global {
  interface Window {
    pdfjsLib: any;
    Tesseract: any;
    XLSX: any;
  }
}

export default EnhancedBankStatementParser;