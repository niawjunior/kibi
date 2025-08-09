"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getUserByRef } from "@/lib/db";
import { User } from "@/lib/supabase";
import { RegistrationForm } from "@/components/registration-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, QrCode } from "lucide-react";
import { Header } from "@/components/header";

export default function RegistrationClient() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Get the user reference from the URL query parameter
        const userRef = searchParams.get("id");

        if (!userRef) {
          setError("No user reference provided. Please scan a valid QR code.");
          setLoading(false);
          return;
        }

        // Fetch user data from the database
        const userData = await getUserByRef(userRef);

        if (!userData) {
          setError("User not found. Please scan a valid QR code.");
          setLoading(false);
          return;
        }

        // Set the user data
        setUser(userData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(
          `An error occurred while fetching user data: ${
            err.message || "Unknown error"
          }`
        );
        setLoading(false);
      }
    }

    fetchUserData();
  }, [searchParams]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Event Registration
          </h1>
          <p className="text-white max-w-lg mx-auto">
            Complete your registration and get your badge printed
          </p>
        </div>

        {loading && (
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
        )}

        {error && (
          <Card className="w-full max-w-lg mx-auto shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Registration Error
              </CardTitle>
              <CardDescription>
                We encountered a problem with your registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">What to do next:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Try scanning your QR code again</li>
                  <li>
                    Check that you&apos;re using the correct QR code for this
                    event
                  </li>
                  <li>Contact the event staff for assistance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && user && (
          <div className="w-full">
            <RegistrationForm user={user} />
          </div>
        )}
      </div>
    </>
  );
}
