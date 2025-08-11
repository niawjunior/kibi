"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  QrCode,
  Camera,
  Printer,
  BadgeCheck,
  ArrowRight,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <Header />
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
          <motion.div
            className="w-full max-w-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h1
                className="text-4xl text-white font-bold mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                AI Kiosk Event Registration
              </motion.h1>
              <motion.p
                className="text-lg text-white max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                A seamless registration experience for event visitors using QR
                codes, camera capture
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-8 mb-12 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="salesforce" className="shadow-lg">
                  <Link href="/generate" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Generate New Visitor QR Code
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring" }}
              >
                <Card className="md:col-span-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        <BadgeCheck className="h-5 w-5 text-primary" />
                      </motion.div>
                      Welcome to Event Registration
                    </CardTitle>
                    <CardDescription>
                      Scan your QR code at the kiosk to begin registration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      This system allows event visitors to quickly register by
                      scanning their QR code, taking a photo, and printing their
                      badge via Bluetooth thermal printer.
                    </p>
                    <p className="mb-4">
                      The registration process is simple and fast, ensuring a
                      smooth check-in experience for all attendees while
                      providing event organizers with accurate attendance
                      tracking.
                    </p>
                    <motion.div
                      className="bg-muted p-4 rounded-lg border border-border mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="font-medium mb-2">Key Features:</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>QR code processing via kiosk scanner</li>
                        <li>Real-time database integration with Supabase</li>
                        <li>Browser-based camera capture</li>

                        <li>Responsive design for various kiosk displays</li>
                      </ul>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring" }}
              >
                <Card className="h-full border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, repeatDelay: 3 }}
                      >
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </motion.div>
                      How It Works
                    </CardTitle>
                    <CardDescription>
                      The registration flow is simple and efficient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      <motion.li
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <span className="font-medium">
                            Kiosk Scans QR Code
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Kiosk scans visitor&apos;s QR code and opens the
                            website
                          </p>
                        </div>
                      </motion.li>
                      <motion.li
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <span className="font-medium">
                            Verify Information
                          </span>
                          <p className="text-sm text-muted-foreground">
                            System retrieves visitor data from Supabase
                          </p>
                        </div>
                      </motion.li>
                      <motion.li
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <span className="font-medium">Take Photo</span>
                          <p className="text-sm text-muted-foreground">
                            Visitor captures their photo using the kiosk camera
                          </p>
                        </div>
                      </motion.li>
                      <motion.li
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <span className="font-medium">Print Badge</span>
                          <p className="text-sm text-muted-foreground">
                            System prints badge with visitor info and photo
                          </p>
                        </div>
                      </motion.li>
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring" }}
              >
                <Card className="h-full border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ repeat: Infinity, repeatDelay: 4 }}
                      >
                        <Printer className="h-5 w-5 text-primary" />
                      </motion.div>
                      Technical Details
                    </CardTitle>
                    <CardDescription>
                      How the system works behind the scenes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="bg-muted rounded-md p-2 flex-shrink-0">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">QR Code Processing</span>
                        <p className="text-sm text-muted-foreground">
                          Kiosk scans QR codes and passes the unique reference
                          ID to our website via URL parameter
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="bg-muted rounded-md p-2 flex-shrink-0">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">Camera Integration</span>
                        <p className="text-sm text-muted-foreground">
                          Uses browser MediaDevices API to access the kiosk
                          camera for photo capture
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      <Users className="h-5 w-5 text-primary" />
                    </motion.div>
                    Test Registration
                  </CardTitle>
                  <CardDescription>
                    Use these test links to simulate kiosk QR code scanning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    For testing purposes, you can use the links below to
                    simulate the kiosk scanning a QR code and opening the
                    browser. Each link represents a different test user in our
                    system, as if the kiosk had scanned their QR code.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild variant="salesforce">
                      <Link href="/register?id=TEST001">Test User 1</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild variant="salesforce">
                      <Link href="/register?id=TEST002">Test User 2</Link>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.footer
              className="mt-12 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p>
                Copyright {new Date().getFullYear()} I&I Group Public Company
                Limited. All Rights Reserved
              </p>
            </motion.footer>
          </motion.div>
        </main>
      </motion.div>
    </>
  );
}
