import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { parseCSV } from '@/lib/csv-parser';
import type { Transaction } from '@/types';

interface CSVUploadProps {
  onUpload: (transactions: Transaction[]) => void;
}

export function CSVUpload({ onUpload }: CSVUploadProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const text = await file.text();

      try {
        const transactions = parseCSV(text);
        onUpload(transactions);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('Failed to parse CSV file. Please check the format.');
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop the CSV file here...</p>
          ) : (
            <>
              <p className="text-lg mb-2">Drag & drop a CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
