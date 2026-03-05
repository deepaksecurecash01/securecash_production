import { useState, useCallback } from "react";

export interface FileUploadResult {
  isProcessed: boolean;
  data?: string | ArrayBuffer | null;
  originalFile?: File;
  error?: string;
}

export const useFileUploadState = () => {
  const [fileUploadResults, setFileUploadResults] = useState<
    Map<string, FileUploadResult>
  >(new Map());

  const setUploadResult = useCallback(
    (fileId: string, result: FileUploadResult) => {
      setFileUploadResults((prev) => new Map(prev.set(fileId, result)));
    },
    [],
  );

  const clearUploadResult = useCallback((fileId: string) => {
    setFileUploadResults((prev) => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });
  }, []);

  const getCompletedUploads = useCallback(() => {
    return Array.from(fileUploadResults.values()).filter(
      (result) => result.isProcessed && result.data,
    );
  }, [fileUploadResults]);

  const clearAllUploads = useCallback(() => {
    setFileUploadResults(new Map());
  }, []);

  return {
    fileUploadResults,
    setUploadResult,
    clearUploadResult,
    getCompletedUploads,
    clearAllUploads,
  };
};
