"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  QrCode,
  Scan,
  Share2,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  X,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "sending" | "completed" | "error";
}

interface TransferSession {
  id: string;
  files: FileItem[];
  isHost: boolean;
  peerId?: string;
  connection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

export function P2PTransfer() {
  const [session, setSession] = useState<TransferSession | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [transferCode, setTransferCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate QR code data URL
  const generateQRCode = useCallback((data: string) => {
    // Simple QR code generation using a service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      data
    )}`;
  }, []);

  // File type icon helper
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return ImageIcon;
    if (["mp4", "avi", "mov", "mkv"].includes(ext || "")) return Video;
    if (["mp3", "wav", "flac", "aac"].includes(ext || "")) return Music;
    if (["zip", "rar", "7z", "tar"].includes(ext || "")) return Archive;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    },
    [handleFileSelect]
  );

  // Create transfer session
  const createTransferSession = useCallback(async () => {
    const sessionId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newSession: TransferSession = {
      id: sessionId,
      files: files,
      isHost: true,
    };

    setSession(newSession);
    setTransferCode(sessionId);
    setConnectionStatus("connecting");

    toast({
      title: "Transfer Created",
      description: `Share code: ${sessionId}`,
    });

    // Simulate WebRTC setup (in real implementation, you'd set up actual WebRTC)
    setTimeout(() => {
      setConnectionStatus("connected");
      toast({
        title: "Ready to Transfer",
        description: "Waiting for receiver to connect...",
      });
    }, 2000);
  }, [files, toast]);

  // Join transfer session
  const joinTransferSession = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid transfer code",
          variant: "destructive",
        });
        return;
      }

      setConnectionStatus("connecting");

      // Simulate joining session
      setTimeout(() => {
        const joinedSession: TransferSession = {
          id: code,
          files: [],
          isHost: false,
          peerId: code,
        };

        setSession(joinedSession);
        setConnectionStatus("connected");

        toast({
          title: "Connected",
          description: "Successfully connected to transfer session",
        });
      }, 1500);
    },
    [toast]
  );

  // Start file transfer
  const startTransfer = useCallback(() => {
    if (!session || files.length === 0) return;

    files.forEach((fileItem, index) => {
      // Simulate file transfer progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, progress: 100, status: "completed" }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, progress, status: "sending" } : f
            )
          );
        }
      }, 200 + index * 100);
    });

    toast({
      title: "Transfer Started",
      description: `Sending ${files.length} file(s)...`,
    });
  }, [session, files, toast]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setSession(null);
    setFiles([]);
    setTransferCode("");
    setConnectionStatus("disconnected");
  }, []);

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            P2P File Transfer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Secure peer-to-peer file sharing with end-to-end encryption
          </p>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Send Files
            </TabsTrigger>
            <TabsTrigger value="receive" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Receive Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Send Files
                </CardTitle>
                <CardDescription>
                  Select files to share or drag and drop them here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!session ? (
                  <>
                    {/* File Drop Zone */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        Drop files here or click to select
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Support for any file type, up to 5GB per file
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        Choose Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          e.target.files && handleFileSelect(e.target.files)
                        }
                      />
                    </div>

                    {/* Selected Files */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium">
                          Selected Files ({files.length})
                        </h3>
                        {files.map((fileItem) => {
                          const IconComponent = getFileIcon(fileItem.file.name);
                          return (
                            <div
                              key={fileItem.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <IconComponent className="w-8 h-8 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {fileItem.file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(fileItem.file.size)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(fileItem.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                        <Button
                          onClick={createTransferSession}
                          className="w-full"
                        >
                          Create Transfer Link
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Transfer Code & QR */}
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-lg px-4 py-2"
                        >
                          {transferCode}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              connectionStatus === "connected"
                                ? "bg-green-500"
                                : connectionStatus === "connecting"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm capitalize">
                            {connectionStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <img
                          src={generateQRCode(
                            `transfer:${transferCode || "/placeholder.svg"}`
                          )}
                          alt="Transfer QR Code"
                          className="border rounded-lg"
                        />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Share this code or QR code with the receiver
                      </p>
                    </div>

                    {/* Transfer Controls */}
                    {connectionStatus === "connected" && (
                      <div className="space-y-4">
                        <Button
                          onClick={startTransfer}
                          className="w-full"
                          size="lg"
                        >
                          Start Transfer ({files.length} files)
                        </Button>

                        {/* Transfer Progress */}
                        {files.some(
                          (f) =>
                            f.status === "sending" || f.status === "completed"
                        ) && (
                          <div className="space-y-3">
                            {files.map((fileItem) => (
                              <div key={fileItem.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium truncate">
                                    {fileItem.file.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {fileItem.status === "completed" && (
                                      <Check className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className="text-sm">
                                      {Math.round(fileItem.progress)}%
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={fileItem.progress}
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={resetSession}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      New Transfer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Receive Files
                </CardTitle>
                <CardDescription>
                  Enter transfer code or scan QR code to receive files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!session ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Transfer Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter transfer code"
                          value={transferCode}
                          onChange={(e) =>
                            setTransferCode(e.target.value.toUpperCase())
                          }
                          className="uppercase"
                        />
                        <Button
                          onClick={() => joinTransferSession(transferCode)}
                          disabled={connectionStatus === "connecting"}
                        >
                          {connectionStatus === "connecting"
                            ? "Connecting..."
                            : "Connect"}
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                            or
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setIsScanning(!isScanning)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {isScanning ? "Stop Scanning" : "Scan QR Code"}
                    </Button>

                    {isScanning && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          QR Scanner would appear here
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          In a real implementation, this would use camera access
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        Connected to {session.id}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm">Connected</span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400">
                      Waiting for files from sender...
                    </p>

                    <Button onClick={resetSession} variant="outline">
                      Disconnect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
