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
import { AlertCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { motion } from "framer-motion";

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
        setTimeout(() => {
          setLoading(false);
        }, 1500);
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
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-3xl font-bold mb-2 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your Exclusive Event Badge
          </motion.h1>
          <motion.p
            className="text-white max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Make your exclusive Salesforce Data Cloud event badge
          </motion.p>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-lg mx-auto shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Loading Registration
                  </motion.span>
                </CardTitle>
                <CardDescription>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Retrieving your information from the system
                  </motion.span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Loader2 className="h-12 w-12 text-secondary animate-spin-slow mb-4" />
                </motion.div>
                <motion.p
                  className="text-center text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  Loading user information...
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-lg mx-auto shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Error
                  </motion.span>
                </CardTitle>
                <CardDescription>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    There was a problem
                  </motion.span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="text-sm font-medium">Possible solutions:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <motion.li
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      Try scanning your QR code again
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      Check that you&apos;re using the correct QR code for this
                      event
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                    >
                      Contact the event staff for assistance
                    </motion.li>
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!loading && !error && user && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <RegistrationForm user={user} />
          </motion.div>
        )}
      </div>
    </>
  );
}
