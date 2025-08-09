"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera as CameraIcon,
  X,
  RefreshCw,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadUserPhoto } from "@/lib/db";

interface CameraProps {
  onCapture: (imageUrl: string, imageBase64: string) => void;
  userRef?: string; // Optional user reference for direct uploads
}

export function Camera({ onCapture, userRef }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true); // Default to mirrored view (selfie-style)
  const [isUploading, setIsUploading] = useState(false); // Track photo upload status

  // Try different camera access methods
  const tryAccessCamera = async (
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> => {
    try {
      console.log("Trying to access camera with constraints:", constraints);
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error("Failed with these constraints:", constraints, err);
      throw err;
    }
  };

  // Initialize camera with fallback options
  const startCamera = async () => {
    try {
      setError(null); // Clear any previous errors
      console.log("Requesting camera access...");

      // Check if running in secure context (HTTPS or localhost)
      if (window.isSecureContext === false) {
        throw new Error(
          "Camera requires a secure context (HTTPS or localhost)"
        );
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Since video element is always rendered, we just need to check if it's available
      if (!videoRef.current) {
        throw new Error("Video element not found. Please try again.");
      }

      // Use a single constraint option for camera
      const constraintOption = {
        video: {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      };

      // Request camera access first
      let mediaStream: MediaStream;
      try {
        mediaStream = await tryAccessCamera(constraintOption);
        console.log(
          "Camera access granted with constraints:",
          constraintOption
        );
      } catch (err) {
        console.warn(`Failed with constraints:`, constraintOption, err);
        throw new Error(
          "Could not access camera with the specified constraints"
        );
      }

      // Double check that video ref still exists
      if (!videoRef.current) {
        // Stop the stream since we can't use it
        mediaStream.getTracks().forEach((track) => track.stop());
        throw new Error("Video element no longer available");
      }

      // Set the media stream as the video source
      videoRef.current.srcObject = mediaStream;

      // Set up metadata loading handler
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        // Make sure component is still mounted when metadata loads
        if (videoRef.current) {
          videoRef.current
            .play()
            .then(() => console.log("Video playback started"))
            .catch((e) => console.error("Error playing video:", e));
        }
      };

      // Update state
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(
        `Camera access error: ${
          err.message || "Unknown error"
        }. Please ensure you have granted camera permissions.`
      );
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Capture photo and upload to Supabase if userRef is provided

  // Capture photo and optionally upload to Supabase
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      try {
        // Set uploading state to true at the beginning
        setIsUploading(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }

        // If the camera is mirrored in the UI, we need to flip the canvas horizontally
        // to ensure the captured photo is not mirrored
        if (mirrored) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Reset transform after drawing
          context.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Convert canvas to base64 image data
        const imageData = canvas.toDataURL("image/jpeg");

        // If userRef is provided, upload to Supabase storage
        if (userRef) {
          try {
            const publicUrl = await uploadUserPhoto(imageData, userRef);
            if (publicUrl) {
              // Pass the public URL to the parent component
              onCapture(publicUrl, imageData);
            } else {
              throw new Error("Failed to upload photo");
            }
          } catch (err) {
            console.error("Error uploading photo:", err);
            setError("Failed to upload photo. Please try again.");
            // Fall back to base64 if upload fails
            onCapture(imageData, imageData);
          }
        } else {
          // If no userRef, just use the base64 data but add a small delay
          // to ensure the loading state is visible
          await new Promise((resolve) => setTimeout(resolve, 500));
          onCapture(imageData, imageData);
        }
      } catch (err) {
        console.error("Error capturing photo:", err);
        setError("Failed to capture photo. Please try again.");
      } finally {
        // Always set uploading to false when done, regardless of path taken
        setIsUploading(false);
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full overflow-hidden ">
        <div className="relative w-full aspect-[3/4] h-[300px] bg-black">
          {/* Always render the video element regardless of camera state */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              transform: mirrored ? "scaleX(-1)" : "none", // Flip horizontally if mirrored is true
            }}
            className={`w-full  aspect-[3/4] h-[300px] object-cover ${
              !isCameraActive ? "hidden" : ""
            }`}
          />

          {isCameraActive && (
            <div className="flex space-x-2 w-full absolute top-2 left-2">
              <Button
                onClick={stopCamera}
                variant="outline"
                size="icon"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  stopCamera();
                  setTimeout(startCamera, 300);
                }}
                variant="outline"
                size="icon"
                disabled={isUploading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setMirrored(!mirrored)}
                variant="outline"
                size="icon"
                title={mirrored ? "Disable mirror mode" : "Enable mirror mode"}
                disabled={isUploading}
              >
                <ArrowRightLeft />
              </Button>
            </div>
          )}
          {/* Overlay UI when camera is not active */}
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-4 text-center">
              <CameraIcon className="h-12 w-12 mb-4 text-muted-foreground" />
              {error ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Camera access was denied or encountered an error.
                  </p>
                  <Button
                    onClick={() => {
                      // Direct call is fine now since video element is always in DOM
                      startCamera();
                    }}
                    variant="default"
                    className="bg-primary/90 hover:bg-primary"
                    size="lg"
                  >
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to start your camera
                  </p>
                  <Button
                    onClick={() => {
                      // Direct call is fine now since video element is always in DOM
                      startCamera();
                    }}
                    variant="default"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />

      {isCameraActive && (
        <div className="flex flex-col px-2 w-full gap-2 justify-center py-2">
          <Button
            onClick={capturePhoto}
            variant="default"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Taking photo...
              </>
            ) : (
              <>
                <CameraIcon className="h-4 w-4 mr-2" />
                Take Photo
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
