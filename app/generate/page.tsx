"use client";

import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Header from "@/components/header";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createVisitor, uploadQrImage } from "@/lib/db";
import { UserProfile } from "@/components/user-profile";
import { User } from "@/lib/supabase";
import { qrCodeToBase64 } from "@/lib/qrUtils";

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  last_name: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  company: z.string().min(1, { message: "Company is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function GenerateQRPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [visitorRef, setVisitorRef] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Effect to handle QR code image generation after QR code is rendered
  useEffect(() => {
    const generateQrImage = async () => {
      if (qrCodeData && qrCodeRef.current && visitorRef) {
        try {
          // Wait a moment for the QR code to render completely
          setTimeout(async () => {
            // Convert QR code to base64 image
            const base64Image = await qrCodeToBase64(
              qrCodeRef as React.RefObject<HTMLDivElement>
            );

            if (base64Image) {
              // Upload QR image to storage bucket
              const uploadedUrl = await uploadQrImage(base64Image, visitorRef);

              if (uploadedUrl) {
                setQrImageUrl(uploadedUrl);

                // Update visitor record with QR image URL
                await fetch("/api/users/update-qr-url", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ref: visitorRef,
                    qrUrl: uploadedUrl,
                  }),
                });
              }
            }
          }, 500);
        } catch (error) {
          console.error("Error generating QR image:", error);
        }
      }
    };

    generateQrImage();
  }, [qrCodeData, visitorRef]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      last_name: "",
      company: "",
      position: "",
      email: "",
      phone: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    setRegisteredUser(null); // Reset registered user when generating new QR
    setQrImageUrl(null); // Reset QR image URL

    try {
      // Generate a unique reference ID for the visitor
      const ref = `REF${Date.now().toString().slice(-6)}${Math.floor(
        Math.random() * 1000
      )}`;
      setVisitorRef(ref);

      // Create the QR code data (URL that will be used for registration)
      const qrUrl = `https://kibi.vercel.app/register?id=${ref}`;
      setQrCodeData(qrUrl);

      // Save visitor data to Supabase first without QR URL
      await createVisitor({
        id: uuidv4(),
        ref: ref,
        ...data,
        event_id: "00000000-0000-0000-0000-000000000001", // Default event ID
        registered: false,
        photo_url: null,
        qr_url: null, // Will be updated after QR image is generated
      });

      // We need to wait for the QR code to be rendered before converting to image
      // This will be handled in a useEffect after the QR code is displayed
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError("Failed to generate QR code. Please try again.");
      setQrCodeData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-4 px-2">
        <div className="flex items-center justify-center flex-wrap mb-8 mt-4">
          <h1 className="text-3xl text-white font-bold text-center">
            Generate Visitor QR Code
          </h1>
        </div>

        {!qrCodeData ? (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Visitor Information</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job position" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="salesforce"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate QR Code"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Your QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Loading visitor information...
                  </p>
                </div>
              ) : registeredUser ? (
                <div className="w-full space-y-6">
                  {/* Display registered user information with photo, badge and QR code */}
                  <UserProfile
                    user={registeredUser}
                    photoUrl={registeredUser.photo_url}
                    badgeUrl={registeredUser.badge_url}
                    showBadge={true}
                    showQr={true}
                  />

                  {/* Display larger badge if available */}
                  {registeredUser.badge_url && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-center">
                        Visitor Badge Preview
                      </h3>
                      <div className="flex justify-center">
                        <div className="relative h-64 w-48 border rounded-md overflow-hidden">
                          <Image
                            src={registeredUser.badge_url}
                            alt="Visitor Badge"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-center mb-4">
                      Reference ID:{" "}
                      <span className="font-bold">{visitorRef}</span>
                    </p>
                    <div className="bg-white p-4 rounded-md mb-4">
                      <QRCode value={qrCodeData} size={200} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-md mb-4" ref={qrCodeRef}>
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        className="w-[200px] h-[200px]"
                      />
                    ) : (
                      <QRCode value={qrCodeData} size={200} />
                    )}
                  </div>

                  <p className="text-center mb-4">
                    Reference ID:{" "}
                    <span className="font-bold">{visitorRef}</span>
                  </p>

                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Scan this QR code at the event registration kiosk
                  </p>
                </>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQrCodeData(null);
                    setVisitorRef(null);
                    setRegisteredUser(null);
                    form.reset();
                  }}
                >
                  Register Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
