"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";

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
import { createVisitor } from "@/lib/db";

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [visitorRef, setVisitorRef] = useState<string | null>(null);

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

    try {
      // Generate a unique reference ID for the visitor
      const ref = `REF${Date.now().toString().slice(-6)}${Math.floor(
        Math.random() * 1000
      )}`;
      setVisitorRef(ref);

      // Create the QR code data (URL that will be used for registration)
      const qrUrl = `${window.location.origin}/register?id=${ref}`;
      setQrCodeData(qrUrl);

      // Save visitor data to Supabase
      await createVisitor({
        id: uuidv4(),
        ref: ref,
        ...data,
        event_id: "00000000-0000-0000-0000-000000000001", // Default event ID
        registered: false,
        photo_url: null,
      });
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError("Failed to generate QR code. Please try again.");
      setQrCodeData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-2">
      <Button variant="outline" onClick={() => router.push("/")}>
        &larr; Back to Home
      </Button>
      <div className="flex items-center justify-center flex-wrap mb-8">
        <h1 className="text-3xl font-bold text-center">
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
            <div className="bg-white p-4 rounded-md mb-4">
              <QRCode value={qrCodeData} size={200} />
            </div>

            <p className="text-center mb-4">
              Reference ID: <span className="font-bold">{visitorRef}</span>
            </p>

            <p className="text-sm text-muted-foreground text-center mb-6">
              Scan this QR code at the event registration kiosk
            </p>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setQrCodeData(null);
                  setVisitorRef(null);
                  form.reset();
                }}
              >
                Register Another
              </Button>

              <Button
                onClick={() => {
                  // Create a temporary link and trigger download
                  const canvas = document.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = `qrcode-${visitorRef}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }
                }}
              >
                Download QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
