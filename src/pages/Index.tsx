
import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadProgress from "@/components/UploadProgress";
import PdfConverter from "@/components/PdfConverter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Shield, 
  Zap, 
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  FileText
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    toast.success('PDF uploaded successfully!');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    // Simulate download
    toast.success('Excel file downloaded successfully!');
    handleReset();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Processing",
      description: "Your bank statements are processed securely and never stored on our servers."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Convert your PDFs to Excel in seconds with our optimized processing engine."
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
      title: "Perfect Formatting",
      description: "Get properly structured Excel files with correct column mapping and formatting."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary-glow/5" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                Convert Bank Statements to{" "}
                <span className="gradient-text">Excel</span>{" "}
                Instantly
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Transform your PDF bank statements into structured Excel files with perfect formatting. 
                Fast, secure, and incredibly accurate.
              </p>

              {/* PDF Converter Component */}
              <div className="max-w-4xl mx-auto mb-12">
                <PdfConverter />
              </div>

              {isUploading && (
                <UploadProgress
                  file={selectedFile}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Converter?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built with cutting-edge technology to deliver the most accurate 
                bank statement conversion experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="card-gradient text-center">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Simple 3-step process to convert your bank statements
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Upload PDF",
                  description: "Select and upload your bank statement PDF file",
                  icon: <FileText className="h-8 w-8" />
                },
                {
                  step: "2", 
                  title: "AI Processing",
                  description: "Our AI extracts and structures your transaction data",
                  icon: <Zap className="h-8 w-8" />
                },
                {
                  step: "3",
                  title: "Download Excel",
                  description: "Get your perfectly formatted Excel file instantly",
                  icon: <FileSpreadsheet className="h-8 w-8" />
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <div className="mb-4 text-primary">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust us with their bank statement conversions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="glow" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Start Converting Now
              </Button>
              <Button variant="outline" size="lg">
                View Pricing Plans
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
