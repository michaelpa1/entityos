import Link from "next/link";
import { ArrowRightIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Entity OS
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Your private dashboard for managing canonical identity and presence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
              <UserRoundIcon className="size-5" />
            </div>
            <CardTitle>Identity</CardTitle>
            <CardDescription>
              Canonical name, bios, links and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/identity" />} variant="outline">
              Open Identity
              <ArrowRightIcon />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
