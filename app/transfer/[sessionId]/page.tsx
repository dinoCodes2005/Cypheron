"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Download } from "lucide-react";

export default function TransferPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const [files, setFiles] = useState<Array<{ name: string; link: string }>>([]);

  useEffect(() => {
    const filesParam = searchParams.get("files");
    if (filesParam) {
      const fileList = decodeURIComponent(filesParam)
        .split("\n")
        .map((line) => {
          const [name, link] = line.split(": ");
          return { name, link };
        })
        .filter((f) => f.name && f.link);

      setFiles(fileList);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Transfer: {sessionId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {files.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Click on any file to download from Google Drive:
                </p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No files found for this transfer session.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
