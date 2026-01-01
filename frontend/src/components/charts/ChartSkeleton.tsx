import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  className?: string;
  hasSelect?: boolean;
}

export function ChartSkeleton({ className, hasSelect = false }: ChartSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </div>
        {hasSelect && (
          <Skeleton className="h-9 w-40" />
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="aspect-auto h-[250px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartBarSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-4 w-[220px] mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full flex items-end justify-around gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton 
                className="w-full" 
                style={{ height: `${Math.random() * 100 + 50}px` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
