"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Briefcase, Tag, UserCheck } from "lucide-react";

interface UserProfileProps {
  user: User;
  photoUrl?: string;
  badgeUrl?: string;
  showBadge?: boolean;
  showQr?: boolean;
}

export function UserProfile({
  user,
  photoUrl,
  badgeUrl,
  showBadge = false,
  showQr = false,
}: UserProfileProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-6">
        {/* User Photo */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">Photo</p>
          <Avatar className="h-24 w-24 ">
            {photoUrl ? (
              <AvatarImage
                className="h-[100px] w-[100px] object-cover"
                src={photoUrl}
                alt={`${user.name} ${user.last_name}`}
                loading="eager"
              />
            ) : (
              <AvatarFallback className="text-2xl">
                {user.name[0]}
                {user.last_name[0]}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Badge Preview */}
        {showBadge && badgeUrl && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-2">Avatar</p>
            <Avatar className="h-24 w-24 ">
              {badgeUrl ? (
                <AvatarImage
                  className="h-[100px] w-[100px] object-cover"
                  src={badgeUrl}
                  alt={`${user.name} ${user.last_name}`}
                />
              ) : (
                <AvatarFallback className="text-2xl">
                  {user.name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}

        {/* QR Code Preview */}
        {showQr && user.qr_url && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-2">QR Code</p>
            <div className="h-24 w-24 bg-white p-1 rounded-md overflow-hidden">
              <img
                className="h-full w-full object-contain"
                src={user.qr_url}
                alt="QR Code"
              />
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {user.name} {user.last_name}
          </CardTitle>
          <CardDescription>
            {user.position} at {user.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {/* <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div> */}

            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.company}</span>
            </div>

            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.position}</span>
            </div>
            {/* 
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div> */}

            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-mono">{user.ref}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center w-full">
            <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm mr-2">Status:</span>
            <Badge
              variant={user.registered ? "default" : "outline"}
              className={user.registered ? "bg-green-600" : ""}
            >
              {user.registered ? "Registered" : "Not Registered"}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
