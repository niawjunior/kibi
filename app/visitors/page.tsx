"use client";

import { useState, useEffect } from "react";
import { getUsersByEvent } from "@/lib/db";
import { User } from "@/lib/supabase";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Search,
  Printer,
  Image as ImageIcon,
  UserIcon,
  Building2,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { printBadge } from "@/lib/printer";

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<User[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [printingVisitor, setPrintingVisitor] = useState<string | null>(null);

  // Default event ID - in a real app, this might come from a context or URL parameter
  const eventId = "00000000-0000-0000-0000-000000000001";

  // Fetch visitors data
  const fetchVisitors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getUsersByEvent(eventId);
      setVisitors(data);
      setFilteredVisitors(data);
    } catch (err) {
      console.error("Error fetching visitors:", err);
      setError("Failed to load visitors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchVisitors();
  }, []);

  // Filter visitors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = visitors.filter(
      (visitor) =>
        visitor.name.toLowerCase().includes(query) ||
        visitor.last_name.toLowerCase().includes(query) ||
        visitor.company.toLowerCase().includes(query) ||
        visitor.email.toLowerCase().includes(query)
    );

    setFilteredVisitors(filtered);
  }, [searchQuery, visitors]);

  // Handle printing a visitor badge
  const handlePrint = (visitor: User) => {
    // Prefer card_url if available, otherwise fall back to badge_url
    const printUrl = visitor.card_url || visitor.badge_url;
    if (!printUrl) {
      alert("No badge available for this visitor");
      return;
    }

    setPrintingVisitor(visitor.id);

    try {
      // For browser printing, we'll open the badge image in a new tab
      // and trigger the print dialog
      printBadge(visitor.print_url!, true); // Enable rotation
    } catch (err) {
      console.error("Error printing badge:", err);
      alert("Failed to print badge. Please try again.");
    } finally {
      setPrintingVisitor(null);
    }
  };

  return (
    <>
      <Header />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6 px-4"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-between items-center mb-6 mt-2"
        >
          <h1 className="text-2xl text-white font-bold">Visitor Management</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={fetchVisitors}
                  className="flex items-center gap-2 hover:bg-primary/20 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh visitor list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Card className="mb-6 border-primary/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search and Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or email..."
                  className="pl-8 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 border border-destructive/30 shadow-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Card className="border-primary/20 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <h3 className="text-lg font-medium">Visitors</h3>
                <Badge variant="outline" className="font-normal">
                  {filteredVisitors.length}{" "}
                  {filteredVisitors.length === 1 ? "visitor" : "visitors"}
                </Badge>
              </div>
              <Table className="overflow-hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                          Loading visitors...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredVisitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No visitors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVisitors.map((visitor, index) => (
                      <motion.tr
                        key={visitor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          delay: index * 0.05,
                          stiffness: 100,
                        }}
                        whileHover={{
                          backgroundColor: "rgba(99, 102, 241, 0.08)",
                          scale: 1.005,
                        }}
                        className="transition-all cursor-pointer hover:shadow-md group"
                        style={{ display: "table-row" }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-full">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {visitor.name}{" "}
                                <span className="text-muted-foreground">
                                  {visitor.last_name}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {visitor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-500/10 p-1.5 rounded-full">
                              <Building2 className="h-4 w-4 text-blue-500" />
                            </div>
                            <span>{visitor.company || "--"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-500/10 p-1.5 rounded-full">
                              <Briefcase className="h-4 w-4 text-amber-500" />
                            </div>
                            <span>{visitor.position || "--"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {visitor.registered ? (
                            <Badge className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              Registered
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <UserIcon className="h-3 w-3" />
                              Not Registered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.badge_url ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    className="relative h-12 w-20 rounded-md overflow-hidden border border-primary/20 shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 10,
                                    }}
                                  >
                                    <Image
                                      onClick={() =>
                                        window.open(visitor.badge_url)
                                      }
                                      src={visitor.badge_url}
                                      alt={`${visitor.name}'s badge`}
                                      fill
                                      className="object-cover cursor-pointer"
                                    />
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to view full badge</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-muted-foreground/20"
                            >
                              <ImageIcon className="h-3 w-3" />
                              No Badge
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.card_url ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    className="relative h-12 w-20 rounded-md overflow-hidden border border-primary/20 shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 10,
                                    }}
                                  >
                                    <Image
                                      onClick={() =>
                                        window.open(visitor.card_url)
                                      }
                                      src={visitor.card_url}
                                      alt={`${visitor.name}'s card`}
                                      fill
                                      className="object-cover cursor-pointer"
                                    />
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to view full card</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-muted-foreground/20"
                            >
                              <ImageIcon className="h-3 w-3" />
                              No Card
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.qr_url ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    className="relative h-12 w-12 rounded-md overflow-hidden border border-primary/20 shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 10,
                                    }}
                                  >
                                    <Image
                                      onClick={() =>
                                        window.open(visitor.qr_url)
                                      }
                                      src={visitor.qr_url}
                                      alt={`${visitor.name}'s QR code`}
                                      fill
                                      className="object-contain cursor-pointer"
                                    />
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to view full QR code</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-muted-foreground/20"
                            >
                              <ImageIcon className="h-3 w-3" />
                              No QR Code
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePrint(visitor)}
                                      disabled={
                                        !(
                                          visitor.card_url || visitor.badge_url
                                        ) || printingVisitor === visitor.id
                                      }
                                      className="flex items-center gap-1 hover:bg-primary/10 transition-colors"
                                    >
                                      <Printer className="h-3 w-3" />
                                      {printingVisitor === visitor.id
                                        ? "Printing..."
                                        : "Print"}
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Print visitor badge</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
