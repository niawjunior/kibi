"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "@/lib/supabase";
import { UserProfile } from "./user-profile";
import { Camera } from "./camera";
import { CameraDebug } from "./camera-debug";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Printer,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
  const [badgePreviewUrl, setBadgePreviewUrl] = useState<string | null>(
    user.badge_url || null
  );
  const [isBadgeLoading, setIsBadgeLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [blendedBadgeUrl, setBlendedBadgeUrl] = useState<string | null>(null);
  const [printUrl, setPrintUrl] = useState<string | null>(null);
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
    setIsPhotoLoading(true);
    setIsImageLoading(true);
    setError(null);

    try {
      if (user && user.ref) {
        // Upload the photo to storage and get public URL
        const publicUrl = await uploadUserPhoto(imageBase64, user.ref);
        if (publicUrl) {
          setPhotoUrl(publicUrl);
          setIsPhotoLoading(false);
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
      // Only use existing badge if user is registered, has a badge_url and photo_url,
      // the photo hasn't changed, AND the avatar style hasn't been changed
      // (we track this by checking if badgePreviewUrl is null - it gets cleared when style changes)
      if (
        user.registered &&
        user.badge_url &&
        user.photo_url &&
        photoUrl === user.photo_url &&
        badgePreviewUrl !== null // If badgePreviewUrl is null, it means style was changed
      ) {
        console.log(
          "Using existing badge URL for registered user:",
          user.badge_url
        );
        setBadgePreviewUrl(user.badge_url);

        // Generate a blended badge image for printing (combining template and photo)
        setIsBlendedBadgeLoading(true);
        const badgeResult = await generateBlendedBadge(user.badge_url, {
          name: user.name,
          last_name: user.last_name,
          company: user.company,
          position: user.position,
        });
        console.log("Badge result:", badgeResult);

        if (badgeResult) {
          setBlendedBadgeUrl(badgeResult.displayUrl);
          setPrintUrl(badgeResult.printUrl);
        }
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

        // Generate blended badge for printing using Canvas
        // Convert base64 to data URL for the blended badge generation
        setIsBlendedBadgeLoading(true);
        const badgeResult = await generateBlendedBadge(
          `data:image/png;base64,${badgeBase64}`,
          {
            name: user.name,
            last_name: user.last_name,
            company: user.company,
            position: user.position,
          }
        );

        if (badgeResult) {
          setBlendedBadgeUrl(badgeResult.displayUrl);
          setPrintUrl(badgeResult.printUrl);
        }
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
      let cardUrl: string | undefined = undefined;
      let printImageUrl: string | undefined = undefined;

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

      // Upload blended badge (card) image if available
      if (blendedBadgeUrl) {
        // For simplicity, we'll use the same upload function but with a different prefix
        const uploadedCardUrl = await uploadBadgeImage(
          blendedBadgeUrl,
          `${user.ref}-card`
        );
        if (uploadedCardUrl) {
          cardUrl = uploadedCardUrl;
        } else {
          console.warn(
            "Failed to upload card image, continuing with registration"
          );
        }
      }

      // Upload print image (rotated) if available
      if (printUrl) {
        console.log("Uploading print image:", printUrl);
        // Use the same upload function with a different prefix for print image
        const uploadedPrintUrl = await uploadBadgeImage(
          printUrl,
          `${user.ref}-print`
        );
        if (uploadedPrintUrl) {
          printImageUrl = uploadedPrintUrl;
        } else {
          console.warn(
            "Failed to upload print image, continuing with registration"
          );
        }
      }

      // The photoUrl is now either a Supabase storage URL or base64 data
      // updateUserRegistration will save this URL to the database
      const updatedUser = await updateUserRegistration(
        user.ref,
        photoUrl,
        badgeUrl,
        cardUrl,
        printImageUrl
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
              // Move to completion step
              setTimeout(() => setCurrentStep("complete"), 500);
              setIsLoading(false);
            } catch (err) {
              console.error("Printing error:", err);
              setError("Failed to print badge. Please try again.");
              setIsLoading(false);
              setCurrentStep("complete");
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
  // Animation variants for step transitions
  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "circOut", // Using a named easing function
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "info":
        return (
          <motion.div
            key="info-step"
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
            variants={stepVariants}
          >
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
          </motion.div>
        );

      case "photo":
        return (
          <motion.div
            key="photo-step"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
          >
            <CardHeader>
              <CardTitle>Take a Photo</CardTitle>
              <CardDescription>
                Please take a photo for your badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Camera on the left */}
                <div className="md:w-1/2">
                  <Card className="">
                    <CardContent className="p-0 px-2">
                      <Camera onCapture={handlePhotoCapture} />
                    </CardContent>
                  </Card>
                </div>

                {/* Preview on the right */}
                <div className="md:w-1/2">
                  {photoUrl ? (
                    <Card className="relative">
                      <CardContent className="p-0 px-2 min-h-[300px]">
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center justify-center  p-4 rounded-md">
                              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                              <p className="text-sm text-muted-foreground">
                                Loading image...
                              </p>
                            </div>
                          </div>
                        )}
                        <div>
                          {!isPhotoLoading && (
                            <Image
                              placeholder="blur"
                              blurDataURL={photoUrl}
                              width={200}
                              height={300}
                              src={photoUrl}
                              alt="Captured photo"
                              loading="eager"
                              priority
                              className="w-full h-[300px]  aspect-[3/4] object-cover"
                              onError={() => {
                                setError(
                                  "Failed to load image. Please try again."
                                );
                              }}
                            />
                          )}
                        </div>
                      </CardContent>
                      <div className="flex items-center justify-center absolute bottom-10 left-1/2 transform -translate-x-1/2">
                        <CardDescription className="text-xs text-white">
                          {user.registered && user.photo_url === photoUrl
                            ? "Existing Photo"
                            : "Photo Preview"}
                        </CardDescription>
                      </div>
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              {/* Avatar Style Selection */}
              <div className="">
                <Label className="block mb-2 mt-4 text-center">
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
                    <Avatar className="h-12 w-12 ">
                      <AvatarImage
                        onClick={() => {
                          setSelectedAvatarStyle("photo-shoot");
                          // Clear badge preview when style changes
                          if (
                            selectedAvatarStyle !== "photo-shoot" &&
                            photoUrl
                          ) {
                            setBadgePreviewUrl(null);
                          }
                        }}
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
                    <Avatar className="h-12 w-12 ">
                      <AvatarImage
                        onClick={() => {
                          setSelectedAvatarStyle("anime");
                          // Clear badge preview when style changes
                          if (selectedAvatarStyle !== "anime" && photoUrl) {
                            setBadgePreviewUrl(null);
                          }
                        }}
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
                    <Avatar className="h-12 w-12 ">
                      <AvatarImage
                        onClick={() => {
                          setSelectedAvatarStyle("80s-Glam");
                          // Clear badge preview when style changes
                          if (selectedAvatarStyle !== "80s-Glam" && photoUrl) {
                            setBadgePreviewUrl(null);
                          }
                        }}
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
                disabled={
                  !photoUrl ||
                  isImageLoading ||
                  isBadgeLoading ||
                  isPhotoLoading
                }
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

            {/* Camera Debug Tool - helps diagnose camera permission issues */}
            <details className="mt-4 px-6">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Having trouble with camera? Click to troubleshoot
              </summary>
              <div className="pt-3">
                <CameraDebug />
              </div>
            </details>
          </motion.div>
        );

      case "preview":
        return (
          <motion.div
            key="preview-step"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
          >
            <CardHeader>
              <CardTitle>Your Event Badge</CardTitle>
              <CardDescription>
                Your personalized Salesforce Data Cloud event badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              {badgePreviewUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* Rotating border effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full z-0"
                        style={{
                          width: "110px",
                          height: "110px",
                          top: "-5px",
                          left: "-5px",
                          border: "2px solid transparent",
                          borderRadius: "50%",
                          borderTopColor: "#3b82f6",
                          borderRightColor: "rgba(59, 130, 246, 0.6)",
                          borderBottomColor: "rgba(59, 130, 246, 0.3)",
                          borderLeftColor: "rgba(59, 130, 246, 0.1)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      {/* Avatar image */}
                      <div
                        className="relative z-10 rounded-full overflow-hidden"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <Image
                          width={100}
                          height={100}
                          src={badgePreviewUrl}
                          alt="Avatar Preview"
                          priority
                          className="object-contain rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Blended Badge for Printing */}
                  {blendedBadgeUrl && (
                    <div className="mt-6">
                      <CardTitle>
                        Your Salesforce Data Cloud Event Badge
                      </CardTitle>
                      <CardDescription>
                        Print this badge as your exclusive
                      </CardDescription>
                      <div className="flex justify-center mt-2">
                        <div className="overflow-hidden rounded-lg w-full max-w-sm">
                          <CardContent className="p-0 flex justify-center items-center">
                            {isBlendedBadgeLoading ? (
                              <div className="flex flex-col items-center justify-center p-4">
                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  Generating your badge...
                                </p>
                              </div>
                            ) : (
                              <motion.div
                                className="relative w-full overflow-hidden rounded-lg p-1"
                                initial={{
                                  boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
                                }}
                                animate={{
                                  boxShadow: [
                                    "0 0 5px rgba(59, 130, 246, 0.5)",
                                    "0 0 20px rgba(59, 130, 246, 0.8)",
                                    "0 0 5px rgba(59, 130, 246, 0.5)",
                                  ],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                {/* Glassmorphism overlay */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 z-10 rounded-lg backdrop-blur-[1px] scale-70"
                                  animate={{
                                    opacity: [0.4, 0.6, 0.4],
                                    background: [
                                      "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.1))",
                                      "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.1))",
                                      "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.1))",
                                    ],
                                  }}
                                  transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />

                                {/* Moving light effect */}
                                <motion.div
                                  className="absolute h-[200%] w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20"
                                  animate={{
                                    left: ["-50%", "150%"],
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatDelay: 2,
                                  }}
                                />

                                {/* Badge image */}
                                <Image
                                  width={400}
                                  height={300}
                                  src={blendedBadgeUrl}
                                  alt="Print-Ready Badge"
                                  priority
                                  className="w-full object-contain relative z-0 rounded-[8px]"
                                />

                                {/* Neon border effect */}
                                <motion.div
                                  className="absolute inset-0 rounded-lg border border-blue-400/30 z-30"
                                  animate={{
                                    boxShadow: [
                                      "0 0 2px rgba(59, 130, 246, 0.3) inset",
                                      "0 0 8px rgba(59, 130, 246, 0.6) inset",
                                      "0 0 2px rgba(59, 130, 246, 0.3) inset",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                />
                              </motion.div>
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
            <CardFooter className="flex flex-col space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg text-sm">
                <h4 className="font-medium mb-2">Print Instructions:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the "Print My Badge" button below</li>
                  <li>
                    Show your badge to the event staff to complete registration
                  </li>
                </ol>
              </div>

              <Button
                onClick={handleRegister}
                disabled={!badgePreviewUrl || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    Print My Badge <Printer className="ml-2 h-5 w-5" />
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
          </motion.div>
        );

      case "printing":
        return (
          <motion.div
            key="printing-step"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
          >
            <CardHeader>
              <CardTitle>Printing Your Badge</CardTitle>
              <CardDescription>Creating your exclusive badge</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-secondary" />
                </div>
                <p className="text-lg font-medium mb-2">
                  Printing your badge... {printProgress}%
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your exclusive Salesforce Data Cloud event badge will be ready
                  shortly
                </p>
                <Progress
                  value={printProgress}
                  className="h-2 w-64 mx-auto bg-muted/30"
                />
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>Cost-Optimized Lead Generation & Revenue Growth</p>
                  <p>15 August 2025 • Studio 4, Kimpton Maa-Lai Bangkok</p>
                </div>
              </div>
            </CardContent>
          </motion.div>
        );

      case "complete":
        return (
          <motion.div
            key="complete-step"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
          >
            <CardHeader>
              <CardTitle>Your Badge is Ready!</CardTitle>
              <CardDescription>
                Your exclusive Salesforce Data Cloud event badge has been
                printed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Thank You, {user.name}!
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto mb-4">
                  Your Salesforce Data Cloud event badge has been printed
                  successfully. Please collect your badge from the staff.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg text-sm text-left max-w-xs mx-auto">
                  <h4 className="font-medium mb-2">Event Details:</h4>
                  <ul className="space-y-1">
                    <li>
                      <span className="font-medium">Date:</span> 15 August 2025
                    </li>
                    <li>
                      <span className="font-medium">Time:</span> 13:30 - 16:30
                      PM
                    </li>
                    <li>
                      <span className="font-medium">Location:</span> Studio 4,
                      6th Floor
                    </li>
                    <li>
                      <span className="font-medium">Venue:</span> Kimpton
                      Maa-Lai Bangkok
                    </li>
                  </ul>
                </div>
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
          </motion.div>
        );
    }
  };

  // Define animation variants for card transitions
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="w-full max-w-lg mx-auto shadow-md">
        {renderStepIndicator()}
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </Card>
    </motion.div>
  );
}
