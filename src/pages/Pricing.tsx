import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Users, 
  Building2, 
  Mail,
  Zap,
  Shield,
  Infinity
} from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      icon: <Users className="h-6 w-6" />,
      description: "Perfect for occasional use",
      monthlyPrice: 0,
      yearlyPrice: 0,
      pagesPerDay: 100,
      features: [
        "100 Pages per Day",
        "IP-based tracking",
        "Basic PDF to Excel conversion",
        "Standard processing speed",
        "Email support"
      ],
      limitations: [
        "Limited to PDF text extraction",
        "No priority support"
      ],
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Registered User",
      icon: <Users className="h-6 w-6" />,
      description: "Enhanced free tier for registered users",
      monthlyPrice: 0,
      yearlyPrice: 0,
      pagesPerDay: 400,
      features: [
        "400 Pages per Day",
        "Account-based tracking",
        "Advanced PDF processing",
        "OCR for scanned documents",
        "Priority email support",
        "Usage history & analytics"
      ],
      limitations: [
        "Daily limits still apply"
      ],
      buttonText: "Register Free",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  const monthlyPlans = [
    {
      name: "Starter",
      price: 10,
      pages: 1000,
      description: "For small businesses",
      popular: false
    },
    {
      name: "Professional", 
      price: 20,
      pages: 3000,
      description: "For growing teams",
      popular: true
    },
    {
      name: "Business",
      price: 50,
      pages: 8000,
      description: "For large organizations",
      popular: false
    }
  ];

  const yearlyPlans = [
    {
      name: "Starter",
      price: 80,
      pages: 10000,
      description: "Save $40 per year",
      popular: false
    },
    {
      name: "Professional",
      price: 100, 
      pages: 13000,
      description: "Save $140 per year",
      popular: true
    },
    {
      name: "Business",
      price: 500,
      pages: 80000,
      description: "Save $100 per year", 
      popular: false
    }
  ];

  const premiumFeatures = [
    "Unlimited file size (up to 100MB)",
    "Batch processing (multiple files)",
    "Advanced OCR with 99.9% accuracy",
    "Custom Excel templates",
    "API access for integration",
    "Priority processing queue",
    "24/7 phone & chat support",
    "Data encryption at rest",
    "Compliance reporting",
    "White-label options"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From free conversions to enterprise solutions. Scale with confidence.
            </p>
          </div>

          {/* Free Plans */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Free Options</h2>
              <p className="text-muted-foreground">Get started without any commitment</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <Card key={index} className="card-gradient relative">
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      {plan.icon}
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-bold">Free</span>
                      <span className="text-muted-foreground">/ forever</span>
                    </div>
                    <div className="text-sm text-primary font-semibold">
                      {plan.pagesPerDay} pages per day
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={plan.buttonVariant} 
                      className="w-full" 
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Monthly Plans */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Monthly Plans</h2>
              <p className="text-muted-foreground">Flexible monthly subscriptions</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {monthlyPlans.map((plan, index) => (
                <Card key={index} className={`card-gradient relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground">{plan.description}</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/ month</span>
                    </div>
                    <div className="text-sm text-primary font-semibold">
                      {plan.pages.toLocaleString()} pages per month
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {premiumFeatures.slice(0, 6).map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={plan.popular ? "glow" : "pricing"} 
                      className="w-full" 
                      size="lg"
                    >
                      Choose {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Annual Plans */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Annual Plans</h2>
              <p className="text-muted-foreground">Save big with yearly subscriptions</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {yearlyPlans.map((plan, index) => (
                <Card key={index} className={`card-gradient relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground">
                      Best Value
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/ year</span>
                    </div>
                    <div className="text-sm text-primary font-semibold">
                      {plan.pages.toLocaleString()} pages per year
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {premiumFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={plan.popular ? "glow" : "pricing"} 
                      className="w-full" 
                      size="lg"
                    >
                      Choose {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Enterprise Plan */}
          <section className="mb-20">
            <Card className="card-gradient max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4">Enterprise</h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Need more than 8,000 pages per month? We've got custom solutions 
                  for enterprise organizations with unlimited processing power.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <Infinity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold">Unlimited Pages</h4>
                    <p className="text-sm text-muted-foreground">No daily or monthly limits</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold">Enhanced Security</h4>
                    <p className="text-sm text-muted-foreground">SOC 2 compliance & audit logs</p>
                  </div>
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold">Dedicated Support</h4>
                    <p className="text-sm text-muted-foreground">Personal account manager</p>
                  </div>
                </div>
                
                <Button variant="glow" size="lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-8">
              We're here to help you choose the perfect plan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Contact Support
              </Button>
              <Button variant="ghost" size="lg">
                View FAQ
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;