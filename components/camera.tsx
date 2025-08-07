"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera as CameraIcon, X, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CameraProps {
  onCapture: (imageData: string) => void;
}

export function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Try different constraints in sequence until one works
      let mediaStream: MediaStream | null = null;
      const constraintOptions = [
        // Option 1: HD with user-facing camera
        {
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        // Option 2: Any front camera
        { video: { facingMode: "user" }, audio: false },
        // Option 3: Any camera
        { video: true, audio: false },
        // Option 4: Low resolution (might work on older devices)
        {
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        },
      ];

      // Try each constraint option until one works
      for (const constraints of constraintOptions) {
        try {
          mediaStream = await tryAccessCamera(constraints);
          console.log("Camera access granted with constraints:", constraints);
          break; // Exit the loop if successful
        } catch (err) {
          console.log("Trying next camera option...");
          console.error("Camera access error:", err);
          // Continue to next option
        }
      }

      if (!mediaStream) {
        throw new Error("Could not access camera with any configuration");
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current
            ?.play()
            .catch((e) => console.error("Error playing video:", e));
        };
        setStream(mediaStream);
        setIsCameraActive(true);
      } else {
        throw new Error("Video reference not available");
      }
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

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 image data
        const imageData = canvas.toDataURL("image/jpeg");
        onCapture(imageData);
      }
    }
  };

  // Initialize camera on mount and clean up on unmount
  useEffect(() => {
    // Add a small delay before starting camera to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      startCamera();
    }, 500);

    // Clean up on unmount
    return () => {
      clearTimeout(timer);
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

      <Card className="w-full overflow-hidden border-2 border-muted">
        <CardContent className="p-0">
          <div className="relative w-full aspect-[3/4] bg-black">
            {!isCameraActive ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-4 text-center">
                <CameraIcon className="h-12 w-12 mb-4 text-muted-foreground" />
                {error ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Camera access was denied or encountered an error.
                    </p>
                    <Button
                      onClick={startCamera}
                      variant="default"
                      className="bg-primary/90 hover:bg-primary"
                      size="lg"
                    >
                      <CameraIcon className="h-4 w-4 mr-2" />
                      Request Camera Permission
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please allow camera access when prompted
                    </p>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <CameraIcon className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex space-x-4 w-full justify-center">
        {isCameraActive && (
          <>
            <Button onClick={capturePhoto} variant="default" className="flex-1">
              <CameraIcon className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="outline" size="icon">
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                stopCamera();
                setTimeout(startCamera, 300);
              }}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
