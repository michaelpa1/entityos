import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="items-center text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestionIcon className="size-6" />
          </div>
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription>
            This route doesn&apos;t exist in Entity OS. Check the URL or head
            back to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/" />}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </main>
  );
}
