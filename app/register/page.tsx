import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { QrCode, Loader2 } from "lucide-react";
import RegistrationClient from "./registration-client";

// Loading component for Suspense fallback
function LoadingCard() {
  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Loading Registration
        </CardTitle>
        <CardDescription>
          Retrieving your information from the system
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin-slow mb-4" />
        <p className="text-center text-muted-foreground">
          Loading user information...
        </p>
      </CardContent>
    </Card>
  );
}

// Main page component with Suspense boundary
export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingCard />}>
        <RegistrationClient />
      </Suspense>
    </div>
  );
}
