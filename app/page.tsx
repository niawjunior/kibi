import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode, Camera, Printer, BadgeCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            AI Kiosk Event Registration
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A seamless registration experience for event visitors using QR
            codes, camera capture, and Bluetooth printing
          </p>
        </div>

        <div className="mt-8 mb-12 flex justify-center">
          <Button asChild variant="default" color="primary" className="">
            <Link href="/generate" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Generate New Visitor QR Code
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Welcome to Event Registration
              </CardTitle>
              <CardDescription>
                Scan your QR code at the kiosk to begin registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This system allows event visitors to quickly register by
                scanning their QR code, taking a photo, and printing their badge
                via Bluetooth thermal printer.
              </p>
              <p className="mb-4">
                The registration process is simple and fast, ensuring a smooth
                check-in experience for all attendees while providing event
                organizers with accurate attendance tracking.
              </p>
              <div className="bg-muted p-4 rounded-lg border border-border mt-4">
                <h3 className="font-medium mb-2">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>QR code processing via kiosk scanner</li>
                  <li>Real-time database integration with Supabase</li>
                  <li>Browser-based camera capture</li>
                  <li>Bluetooth thermal printer support via RAWBT protocol</li>
                  <li>Responsive design for various kiosk displays</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Sample QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="w-40 h-40 bg-white p-2 rounded-lg border border-border mb-4">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,0 L40,0 L40,40 L0,40 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path d="M10,10 L30,10 L30,30 L10,30 Z" fill="currentColor" />

                  <path
                    d="M60,0 L100,0 L100,40 L60,40 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path d="M70,10 L90,10 L90,30 L70,30 Z" fill="currentColor" />

                  <path
                    d="M0,60 L40,60 L40,100 L0,100 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <path d="M10,70 L30,70 L30,90 L10,90 Z" fill="currentColor" />

                  <path d="M60,60 L70,60 L70,70 L60,70 Z" fill="currentColor" />
                  <path d="M80,60 L90,60 L90,70 L80,70 Z" fill="currentColor" />
                  <path d="M60,80 L70,80 L70,90 L60,90 Z" fill="currentColor" />
                  <path
                    d="M80,80 L100,80 L100,100 L80,100 Z"
                    fill="currentColor"
                  />

                  <path
                    d="M50,10 L50,40"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    d="M50,60 L50,90"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    d="M10,50 L40,50"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    d="M60,50 L90,50"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Visitors receive QR codes like this via email before the event
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
              <CardDescription>
                The registration flow is simple and efficient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-medium">Kiosk Scans QR Code</span>
                    <p className="text-sm text-muted-foreground">
                      Kiosk scans visitor&apos;s QR code and opens the website
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-medium">Verify Information</span>
                    <p className="text-sm text-muted-foreground">
                      System retrieves visitor data from Supabase
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-medium">Take Photo</span>
                    <p className="text-sm text-muted-foreground">
                      Visitor captures their photo using the kiosk camera
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="font-medium">Print Badge</span>
                    <p className="text-sm text-muted-foreground">
                      System prints badge with visitor info and photo
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                Technical Details
              </CardTitle>
              <CardDescription>
                How the system works behind the scenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-2 flex-shrink-0">
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-medium">QR Code Processing</span>
                  <p className="text-sm text-muted-foreground">
                    Kiosk scans QR codes and passes the unique reference ID to
                    our website via URL parameter
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-2 flex-shrink-0">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-medium">Camera Integration</span>
                  <p className="text-sm text-muted-foreground">
                    Uses browser MediaDevices API to access the kiosk camera for
                    photo capture
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-2 flex-shrink-0">
                  <Printer className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-medium">Bluetooth Printing</span>
                  <p className="text-sm text-muted-foreground">
                    Utilizes RAWBT protocol to send ESC/POS commands to thermal
                    printers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Test Registration
            </CardTitle>
            <CardDescription>
              Use these test links to simulate kiosk QR code scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For testing purposes, you can use the links below to simulate the
              kiosk scanning a QR code and opening the browser. Each link
              represents a different test user in our system, as if the kiosk
              had scanned their QR code.
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4">
            <Button asChild variant="default">
              <Link href="/register?id=TEST001">Test User 1</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/register?id=TEST002">Test User 2</Link>
            </Button>
          </CardFooter>
        </Card>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            AI Kiosk Event Registration System &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
