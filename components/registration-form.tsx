"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/lib/supabase";
import { UserProfile } from "./user-profile";
import { Camera } from "./camera";
import { CameraDebug } from "./camera-debug";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building,
  Briefcase,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Printer,
  Tag,
  User as UserIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updateUserRegistration, uploadBadgeImage, uploadUserPhoto } from "@/lib/db";
import { generateBadgePreview } from "@/lib/badge";
import {
  prepareImageForPrinting as generatePrintData,
  generateRawBtUrl as generateRawbtUrl,
} from "@/lib/printer";
import { Progress } from "@/components/ui/progress";

interface RegistrationFormProps {
  user: User;
}

type RegistrationStep = "info" | "photo" | "preview" | "printing" | "complete";

export function RegistrationForm({ user }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("info");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [badgePreviewUrl, setBadgePreviewUrl] = useState<string | null>(null);
  const [isBadgeLoading, setIsBadgeLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printProgress, setPrintProgress] = useState(0);

  // Handle photo capture
  const handlePhotoCapture = async (imageUrl: string, imageBase64: string) => {
    setIsImageLoading(true);
    setPhotoBase64(imageBase64); // Keep base64 for printing
    setError(null);

    try {
      if (user && user.ref) {
        // Upload the photo to storage and get public URL
        const publicUrl = await uploadUserPhoto(imageBase64, user.ref);
        if (publicUrl) {
          setPhotoUrl(publicUrl);
          // After successful photo upload, proceed to generate badge preview
          // handleGenerateBadgePreview(publicUrl);
        } else {
          setError("Failed to upload photo. Please try again.");
          setPhotoUrl(imageUrl); // Fallback to local URL
        }
      } else {
        setPhotoUrl(imageUrl); // Fallback if no user ref available
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError("Failed to upload photo. Please try again.");
      setPhotoUrl(imageUrl); // Fallback to local URL
    } finally {
      setIsImageLoading(false);
    }
  };

  // Generate badge preview
  const handleGenerateBadgePreview = async (imageUrl?: string) => {
    const photoToUse = imageUrl || photoUrl;

    if (!photoToUse || !user) {
      setError("Photo is required for badge preview");
      return;
    }

    setIsBadgeLoading(true);
    setError(null);

    try {
      // Use a placeholder background image URL for now
      // In a real implementation, you would have a badge template stored in your assets
      const backgroundImageUrl = "/badge-template.png";

      // Generate badge preview using OpenAI API
      const badgeBase64 = await generateBadgePreview(
        backgroundImageUrl,
        photoToUse,
        `${user.name} ${user.last_name}`
      );

      if (badgeBase64) {
        // Convert base64 to data URL for display
        setBadgePreviewUrl(`data:image/png;base64,${badgeBase64}`);
        setCurrentStep("preview");
      } else {
        setError("Failed to generate badge preview. Please try again.");
      }
    } catch (error) {
      console.error("Error generating badge preview:", error);
      setError("Failed to generate badge preview. Please try again.");
    } finally {
      setIsBadgeLoading(false);
    }
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
      // Upload badge image to storage if we have a badge preview
      let badgeUrl: string | undefined = undefined;
      if (badgePreviewUrl) {
        const uploadedBadgeUrl = await uploadBadgeImage(badgePreviewUrl, user.ref);
        if (uploadedBadgeUrl) {
          badgeUrl = uploadedBadgeUrl;
        } else {
          console.warn("Failed to upload badge image, continuing with registration");
        }
      }

      // The photoUrl is now either a Supabase storage URL or base64 data
      // updateUserRegistration will save this URL to the database
      const updatedUser = await updateUserRegistration(user.ref, photoUrl, badgeUrl);

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
      preview: 3,
      printing: 4,
      complete: 5,
    };
    return steps[step];
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const currentStepNumber = getStepNumber(currentStep);
    const totalSteps = 5;

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
              <CardTitle>Visitor Information</CardTitle>
              <CardDescription>
                Please verify your information below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UserProfile user={user} photoUrl={photoUrl || undefined} />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setCurrentStep("photo")}
                className="w-full"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );

      case "photo":
        return (
          <>
            <CardHeader>
              <CardTitle>Take a Photo</CardTitle>
              <CardDescription>
                Please take a photo for your badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Camera on the left */}
                <div className="rounded-lg overflow-hidden border border-muted md:w-1/2">
                  <Card>
                    <CardContent className="p-0 px-2">
                      <Camera onCapture={handlePhotoCapture} />
                    </CardContent>
                  </Card>
                </div>

                {/* Preview on the right */}
                <div className="md:w-1/2">
                  {photoUrl ? (
                    <Card className="overflow-hidden border border-muted h-full">
                      <CardContent className="p-0 flex justify-center items-center min-h-[270px]">
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
                              setError(
                                "Failed to load image. Please try again."
                              );
                            }}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center h-full">
                        <CardDescription className="text-sm">
                          Photo Preview
                        </CardDescription>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg h-full">
                      <p className="text-sm text-muted-foreground text-center">
                        Take a photo using the camera on the left
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
                onClick={() => handleGenerateBadgePreview()}
                disabled={!photoUrl || isImageLoading || isBadgeLoading}
                className="w-full"
              >
                {isBadgeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Badge Preview...
                  </>
                ) : (
                  <>
                    Preview Badge <Eye className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep("info")}
                disabled={isImageLoading || isBadgeLoading}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </CardFooter>
          </>
        );

      case "preview":
        return (
          <>
            <CardHeader>
              <CardTitle>Badge Preview</CardTitle>
              <CardDescription>
                Review your badge before printing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {badgePreviewUrl ? (
                <div className="flex justify-center">
                  <Card className="overflow-hidden border border-muted w-full max-w-sm">
                    <CardContent className="p-0 flex justify-center items-center">
                      <Image
                        width={400}
                        height={300}
                        src={badgePreviewUrl}
                        alt="Badge Preview"
                        priority
                        className="w-full object-contain"
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p className="text-lg text-muted-foreground">
                    Generating badge preview...
                  </p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                onClick={handleRegister}
                disabled={!badgePreviewUrl || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    Print Badge <Printer className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep("photo")}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Photo
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
    <Card className="w-full max-w-lg mx-auto shadow-md">
      {renderStepIndicator()}
      {renderStepContent()}
    </Card>
  );
}
