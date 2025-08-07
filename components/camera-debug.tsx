'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, Camera as CameraIcon, Check, X } from 'lucide-react';

/**
 * Camera Debug Component
 * 
 * This component helps diagnose camera access issues by checking:
 * 1. Secure context (HTTPS or localhost)
 * 2. MediaDevices API availability
 * 3. Permission status
 * 4. Browser compatibility
 */
export function CameraDebug() {
  const [debugInfo, setDebugInfo] = useState<{
    isSecureContext: boolean;
    hasMediaDevices: boolean;
    hasGetUserMedia: boolean;
    browserName: string;
    permissionStatus: string;
    error: string | null;
  }>({
    isSecureContext: false,
    hasMediaDevices: false,
    hasGetUserMedia: false,
    browserName: 'Unknown',
    permissionStatus: 'unknown',
    error: null
  });

  // Check browser environment
  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'Chrome';
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'Firefox';
    } else if (userAgent.match(/safari/i)) {
      browserName = 'Safari';
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'Opera';
    } else if (userAgent.match(/edg/i)) {
      browserName = 'Edge';
    }

    // Check environment
    const isSecureContext = window.isSecureContext;
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    setDebugInfo(prev => ({
      ...prev,
      isSecureContext,
      hasMediaDevices,
      hasGetUserMedia,
      browserName
    }));

    // Check permission status if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(permissionStatus => {
          setDebugInfo(prev => ({
            ...prev,
            permissionStatus: permissionStatus.state
          }));

          // Listen for permission changes
          permissionStatus.onchange = () => {
            setDebugInfo(prev => ({
              ...prev,
              permissionStatus: permissionStatus.state
            }));
          };
        })
        .catch(err => {
          setDebugInfo(prev => ({
            ...prev,
            error: `Permission query error: ${err.message}`
          }));
        });
    }
  }, []);

  // Test camera access
  const testCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop());
      
      setDebugInfo(prev => ({
        ...prev,
        permissionStatus: 'granted',
        error: null
      }));
    } catch (err: any) {
      setDebugInfo(prev => ({
        ...prev,
        error: `Camera test failed: ${err.message}`,
        permissionStatus: 'denied'
      }));
    }
  };

  // Render status indicator
  const StatusIndicator = ({ isOk }: { isOk: boolean }) => (
    isOk ? 
      <Check className="h-4 w-4 text-green-500" /> : 
      <X className="h-4 w-4 text-red-500" />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="h-5 w-5 mr-2" />
          Camera Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Secure Context (HTTPS/localhost):</span>
            <StatusIndicator isOk={debugInfo.isSecureContext} />
          </div>
          <div className="flex justify-between items-center">
            <span>MediaDevices API Available:</span>
            <StatusIndicator isOk={debugInfo.hasMediaDevices} />
          </div>
          <div className="flex justify-between items-center">
            <span>getUserMedia Available:</span>
            <StatusIndicator isOk={debugInfo.hasGetUserMedia} />
          </div>
          <div className="flex justify-between items-center">
            <span>Browser:</span>
            <span>{debugInfo.browserName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Camera Permission:</span>
            <span className={`font-medium ${
              debugInfo.permissionStatus === 'granted' ? 'text-green-500' :
              debugInfo.permissionStatus === 'denied' ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {debugInfo.permissionStatus}
            </span>
          </div>
        </div>

        {debugInfo.error && (
          <Alert variant="destructive">
            <AlertDescription>{debugInfo.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center pt-2">
          <Button onClick={testCameraAccess} variant="outline">
            <CameraIcon className="h-4 w-4 mr-2" />
            Test Camera Access
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
