import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Users, Crown } from "lucide-react";

interface UsageCounterProps {
  pagesUsed: number;
  pageLimit: number;
  userType: 'free' | 'registered' | 'premium';
}

const UsageCounter = ({
  pagesUsed,
  pageLimit,
  userType,
}: UsageCounterProps) => {
  const percentage = Math.min(100, Math.round((pagesUsed / pageLimit) * 100));

  const getIcon = () => {
    switch (userType) {
      case 'free':
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'registered':
        return <Users className="h-5 w-5 text-primary" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-success';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm text-muted-foreground capitalize">{userType} plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {Math.min(pagesUsed, pageLimit)} / {pageLimit} pages
            </span>
            <span className={`inline-block h-2 w-2 rounded-full ${getProgressColor()}`} aria-hidden />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Usage</span>
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>

        <Progress value={percentage} />

        {percentage >= 90 && (
          <p className="mt-2 text-xs text-destructive">
            You’re almost out of pages. Consider upgrading your plan.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageCounter;
