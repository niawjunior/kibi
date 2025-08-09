"use client";

import React, { useEffect, useState } from "react";
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
  WandSparkles,
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
import {
  updateUserRegistration,
  uploadBadgeImage,
  uploadUserPhoto,
} from "@/lib/db";
import {
  generateBadgePreview,
  generateBlendedBadge,
  AvatarStyle,
} from "@/lib/badge";
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    user.photo_url || null
  );
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [badgePreviewUrl, setBadgePreviewUrl] = useState<string | null>(
    user.badge_url || null
  );
  const [badgeBase64, setBadgeBase64] = useState<string | null>(null);
  const [isBadgeLoading, setIsBadgeLoading] = useState(false);
  const [blendedBadgeUrl, setBlendedBadgeUrl] = useState<string | null>(null);
  const [isBlendedBadgeLoading, setIsBlendedBadgeLoading] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] =
    useState<AvatarStyle>("photo-shoot");

  // If user is already registered, use their existing photo and badge from Supabase
  useEffect(() => {
    if (user.registered) {
      console.log("User is registered, using data from Supabase");
      console.log("Photo URL from Supabase:", user.photo_url);
      console.log("Badge URL from Supabase:", user.badge_url);

      // Set photo and badge from Supabase data
      setPhotoUrl(user.photo_url || null);
      setBadgePreviewUrl(user.badge_url || null);

      // Always start at step 1 (info) as requested
      setCurrentStep("info");
    }
  }, [user]);
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

  // Generate badge preview using OpenAI API
  const handleGenerateBadgePreview = async () => {
    if (!photoUrl) return;

    setIsBadgeLoading(true);
    setError(null);

    try {
      // Check if user is registered AND has not taken a new photo
      // If the current photoUrl is the same as the one stored in user.photo_url, use existing badge
      if (
        user.registered &&
        user.badge_url &&
        user.photo_url &&
        photoUrl === user.photo_url
      ) {
        console.log(
          "Using existing badge URL for registered user:",
          user.badge_url
        );
        setBadgePreviewUrl(user.badge_url);

        // Generate a blended badge image for printing (combining template and photo)
        setIsBlendedBadgeLoading(true);
        const blendedBadgeUrl = await generateBlendedBadge(user.badge_url, {
          name: user.name,
          last_name: user.last_name,
          company: user.company,
          position: user.position,
        });
        setBlendedBadgeUrl(blendedBadgeUrl);
        setIsBlendedBadgeLoading(false);

        setCurrentStep("preview");
        return;
      }

      // For non-registered users OR registered users with a new photo, generate new badge
      console.log(
        "Generating new badge for",
        user.registered ? "registered user with new photo" : "new user",
        "using style:",
        selectedAvatarStyle
      );

      const badgeBase64 = await generateBadgePreview(
        photoUrl,
        user.name || "",
        selectedAvatarStyle
      );

      if (badgeBase64) {
        // Convert base64 to data URL for display
        setBadgePreviewUrl(`data:image/png;base64,${badgeBase64}`);
        setBadgeBase64(badgeBase64);

        // Generate blended badge for printing using Canvas
        // Convert base64 to data URL for the blended badge generation
        setIsBlendedBadgeLoading(true);
        const blendedBadgeUrl = await generateBlendedBadge(
          `data:image/png;base64,${badgeBase64}`,
          {
            name: user.name,
            last_name: user.last_name,
            company: user.company,
            position: user.position,
          }
        );
        setBlendedBadgeUrl(blendedBadgeUrl);
        setIsBlendedBadgeLoading(false);
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
        const uploadedBadgeUrl = await uploadBadgeImage(
          badgePreviewUrl,
          user.ref
        );
        if (uploadedBadgeUrl) {
          badgeUrl = uploadedBadgeUrl;
        } else {
          console.warn(
            "Failed to upload badge image, continuing with registration"
          );
        }
      }

      // The photoUrl is now either a Supabase storage URL or base64 data
      // updateUserRegistration will save this URL to the database
      const updatedUser = await updateUserRegistration(
        user.ref,
        photoUrl,
        badgeUrl
      );

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
              <UserProfile
                user={user}
                photoUrl={photoUrl || undefined}
                showBadge={badgePreviewUrl ? true : false}
                badgeUrl={badgePreviewUrl || undefined}
              />

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
                <div className="md:w-1/2">
                  <Card className="">
                    <CardContent className="p-0 px-2 min-h-[370px]">
                      <Camera onCapture={handlePhotoCapture} />
                    </CardContent>
                  </Card>
                </div>

                {/* Preview on the right */}
                <div className="md:w-1/2">
                  {photoUrl ? (
                    <Card className="">
                      <CardContent className="p-0 px-2 min-h-[300px]">
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
                            height={300}
                            src={photoUrl}
                            alt="Captured photo"
                            priority
                            className="w-full  aspect-[3/4] h-[300px] object-cover"
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
                      <CardFooter className="flex justify-center h-[45px]">
                        <CardDescription className="text-sm">
                          {user.registered && user.photo_url === photoUrl
                            ? "Existing Photo"
                            : "Photo Preview"}
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
              {/* Avatar Style Selection */}
              <div className="mb-2">
                <Label className="block mb-2 text-center">
                  Select Avatar Style
                </Label>
                <div className="flex justify-center gap-3">
                  <div
                    className={`border-[4px] rounded-full  ${
                      selectedAvatarStyle === "photo-shoot"
                        ? "border-secondary"
                        : ""
                    }`}
                  >
                    <Avatar className="h-24 w-24 ">
                      <AvatarImage
                        onClick={() => setSelectedAvatarStyle("photo-shoot")}
                        className={`h-full w-full object-cover ${
                          selectedAvatarStyle === "photo-shoot"
                            ? "scale-110"
                            : ""
                        }`}
                        src="./photo-shoot.webp"
                        alt="photo-shoot"
                      />
                    </Avatar>
                  </div>

                  <div
                    className={`border-[4px] rounded-full  ${
                      selectedAvatarStyle === "anime" ? "border-blue-500" : ""
                    }`}
                  >
                    <Avatar className="h-24 w-24 ">
                      <AvatarImage
                        onClick={() => setSelectedAvatarStyle("anime")}
                        className={`h-full w-full object-cover ${
                          selectedAvatarStyle === "anime" ? "scale-110" : ""
                        }`}
                        src="./anime.webp"
                        alt="anime"
                      />
                    </Avatar>
                  </div>

                  <div
                    className={`border-[4px] rounded-full  ${
                      selectedAvatarStyle === "80s-Glam"
                        ? "border-blue-500"
                        : ""
                    }`}
                  >
                    <Avatar className="h-24 w-24 ">
                      <AvatarImage
                        onClick={() => setSelectedAvatarStyle("80s-Glam")}
                        className={`h-full w-full object-cover ${
                          selectedAvatarStyle === "80s-Glam" ? "scale-110" : ""
                        }`}
                        src="./80s-glam.webp"
                        alt="80s-Glam"
                      />
                    </Avatar>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleGenerateBadgePreview()}
                disabled={!photoUrl || isImageLoading || isBadgeLoading}
                className="w-full"
              >
                {isBadgeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Avatar...
                  </>
                ) : (
                  <>
                    Generate Avatar <WandSparkles className="ml-2 h-4 w-4" />
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
              <CardTitle>Avatar Preview</CardTitle>
              <CardDescription>
                Review your avatar before printing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {badgePreviewUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Image
                      width={200}
                      height={200}
                      src={badgePreviewUrl}
                      alt="Avatar Preview"
                      priority
                      className="object-contain"
                    />
                  </div>

                  {/* Blended Badge for Printing */}
                  {blendedBadgeUrl && (
                    <div className="mt-6">
                      <CardTitle>Print-Ready Badge</CardTitle>
                      <CardDescription>
                        This badge is ready for printing
                      </CardDescription>
                      <div className="flex justify-center mt-2">
                        <div className="overflow-hidden border border-muted w-full max-w-sm">
                          <CardContent className="p-0 flex justify-center items-center">
                            {isBlendedBadgeLoading ? (
                              <div className="flex flex-col items-center justify-center p-4">
                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  Generating print badge...
                                </p>
                              </div>
                            ) : (
                              <Image
                                width={400}
                                height={300}
                                src={blendedBadgeUrl}
                                alt="Print-Ready Badge"
                                priority
                                className="w-full object-contain"
                              />
                            )}
                          </CardContent>
                        </div>
                      </div>
                    </div>
                  )}
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
