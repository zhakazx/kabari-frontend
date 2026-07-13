import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <SkeletonText lines={5} />
        </CardContent>
      </Card>
    </div>
  );
}
