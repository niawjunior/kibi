'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Mail, Briefcase, Tag, Calendar, UserCheck } from 'lucide-react';

interface UserProfileProps {
  user: User;
  photoUrl?: string;
}

export function UserProfile({ user, photoUrl }: UserProfileProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Avatar className="h-24 w-24 border-2 border-primary">
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={user.name} />
          ) : (
            <AvatarFallback className="text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <CardDescription>{user.position} at {user.company}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.company}</span>
            </div>
            
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.position}</span>
            </div>
            
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-mono">{user.ref}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.event_id}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center w-full">
            <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm mr-2">Status:</span>
            <Badge variant={user.registered ? "default" : "outline"} className={user.registered ? "bg-green-600" : ""}>
              {user.registered ? "Registered" : "Not Registered"}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
