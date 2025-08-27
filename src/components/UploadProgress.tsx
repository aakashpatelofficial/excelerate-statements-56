import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, FileText, Loader2 } from "lucide-react";

interface UploadProgressProps {
  file: File | null;
  onDownload: () => void;
  onReset: () => void;
}

const UploadProgress = ({ file, onDownload, onReset }: UploadProgressProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [stage, setStage] = useState<'upload' | 'convert' | 'complete'>('upload');

  useEffect(() => {
    if (!file) return;

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStage('convert');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(uploadInterval);
  }, [file]);

  useEffect(() => {
    if (stage !== 'convert') return;

    // Simulate conversion progress
    const conversionInterval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 100) {
          clearInterval(conversionInterval);
          setStage('complete');
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(conversionInterval);
  }, [stage]);

  if (!file) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto card-gradient">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Upload Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress 
              value={uploadProgress} 
              className="h-2"
            />
          </div>

          {/* Conversion Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Conversion Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(conversionProgress)}%
              </span>
            </div>
            <Progress 
              value={conversionProgress} 
              className="h-2"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 py-4">
            {stage === 'upload' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Uploading PDF...</span>
              </>
            )}
            {stage === 'convert' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Converting to Excel...</span>
              </>
            )}
            {stage === 'complete' && (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Conversion Complete!
                </span>
              </>
            )}
          </div>

          {/* Action Button */}
          {stage === 'complete' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="glow" 
                size="lg" 
                onClick={onDownload}
                className="flex-1"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Excel File
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onReset}
                className="flex-1 sm:flex-none"
              >
                Convert Another
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgress;