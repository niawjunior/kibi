"use client";

import React, { useState } from "react";
import { User } from "@/lib/supabase";
import { UserProfile } from "./user-profile";
import { Camera } from "./camera";
import { CameraDebug } from "./camera-debug";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updateUserRegistration } from "@/lib/db";
import {
  prepareImageForPrinting as generatePrintData,
  generateRawBtUrl as generateRawbtUrl,
} from "@/lib/printer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Printer,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface RegistrationFormProps {
  user: User;
}

type RegistrationStep = "info" | "photo" | "printing" | "complete";

export function RegistrationForm({ user }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("info");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printProgress, setPrintProgress] = useState(0);

  // Handle photo capture
  const handlePhotoCapture = (imageUrl: string, imageBase64: string) => {
    setIsImageLoading(true);
    setPhotoUrl(imageUrl);
    setPhotoBase64(imageBase64);
    setError(null);

    // Safety timeout to ensure loading state doesn't get stuck
    setTimeout(() => {
      setIsImageLoading(false);
    }, 2000); // Force loading to end after 2 seconds max
  };

  // Handle registration submission
  const handleRegister = async () => {
    if (!photoUrl) {
      setError("Please take a photo before registering.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // The photoUrl is now either a Supabase storage URL or base64 data
      // updateUserRegistration will save this URL to the database
      const updatedUser = await updateUserRegistration(user.ref, photoUrl);

      if (!updatedUser) {
        throw new Error("Failed to update registration status.");
      }

      // Move to printing step
      setCurrentStep("printing");

      // Simulate printing process with progress updates
      const simulatePrinting = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setPrintProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);
            try {
              // Generate print data (ESC/POS commands)
              const printData = generatePrintData(photoBase64);

              // Generate RAWBT URL for Bluetooth printing
              const rawbtUrl = generateRawbtUrl(printData);

              // Log the URL (in a real app, we would open this URL to trigger printing)
              console.log("Print URL:", rawbtUrl);

              // Move to completion step
              setTimeout(() => setCurrentStep("complete"), 500);
            } catch (err) {
              console.error("Printing error:", err);
              setError("Failed to print badge. Please try again.");
              setIsLoading(false);
            }
          }
        }, 200);
      };

      simulatePrinting();
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register. Please try again.");
      setIsLoading(false);
    }
  };

  // Get step number for progress indicator
  const getStepNumber = (step: RegistrationStep): number => {
    const steps: Record<RegistrationStep, number> = {
      info: 1,
      photo: 2,
      printing: 3,
      complete: 4,
    };
    return steps[step];
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const currentStepNumber = getStepNumber(currentStep);
    const totalSteps = 4;

    return (
      <div className="px-6 pt-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-muted-foreground">
            Step {currentStepNumber} of {totalSteps}
          </p>
          <p className="text-sm font-medium">
            {Math.round((currentStepNumber / totalSteps) * 100)}%
          </p>
        </div>
        <Progress
          value={(currentStepNumber / totalSteps) * 100}
          className="h-2"
        />
      </div>
    );
  };

  // Render different content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "info":
        return (
          <>
            <CardHeader>
              <CardTitle>Verify Your Information</CardTitle>
              <CardDescription>
                Please confirm your details before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile user={user} />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setCurrentStep("photo")}
                className="w-full"
              >
                Confirm & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );

      case "photo":
        return (
          <>
            <CardHeader>
              <CardTitle>Take Your Photo</CardTitle>
              <CardDescription>
                This will be used on your event badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4">
                <Camera onCapture={handlePhotoCapture} userRef={user.ref} />
              </div>

              {photoUrl && (
                <Card className="overflow-hidden border border-muted">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Photo Preview</CardTitle>
                  </CardHeader>
                  <CardContent
                    className="p-0 flex justify-center items-center"
                    style={{ minHeight: "266px" }}
                  >
                    {isImageLoading && (
                      <div className="flex flex-col items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Loading image...
                        </p>
                      </div>
                    )}
                    <div className={isImageLoading ? "hidden" : "block"}>
                      <Image
                        width={200}
                        height={200}
                        src={photoUrl}
                        alt="Captured photo"
                        priority
                        className="w-full max-w-[200px] aspect-[3/4] object-cover"
                        onLoadingComplete={() => setIsImageLoading(false)}
                        onError={() => {
                          setIsImageLoading(false);
                          setError("Failed to load image. Please try again.");
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Camera Debug Tool - helps diagnose camera permission issues */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Having trouble with camera? Click to troubleshoot
                </summary>
                <div className="pt-3">
                  <CameraDebug />
                </div>
              </details>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                onClick={handleRegister}
                disabled={!photoUrl || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    Register & Print Badge{" "}
                    <BadgeCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep("info")}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </CardFooter>
          </>
        );

      case "printing":
        return (
          <>
            <CardHeader>
              <CardTitle>Printing Badge</CardTitle>
              <CardDescription>
                Please wait while we prepare your badge
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">
                  Printing in progress... {printProgress}%
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your badge will be ready shortly
                </p>
                <Progress value={printProgress} className="h-2 w-64 mx-auto" />
              </div>
            </CardContent>
          </>
        );

      case "complete":
        return (
          <>
            <CardHeader>
              <CardTitle>Registration Complete</CardTitle>
              <CardDescription>
                Your badge has been printed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Thank You, {user.name}!
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Your registration is complete and your badge has been printed.
                  Please collect your badge and enjoy the event!
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      {renderStepIndicator()}
      {renderStepContent()}
    </Card>
  );
}
