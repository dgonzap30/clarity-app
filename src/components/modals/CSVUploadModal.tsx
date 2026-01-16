import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload,
  FileText,
  AlertTriangle,
  Check,
  ArrowRight,
  ArrowLeft,
  Copy,
  SkipForward,
} from 'lucide-react';
import { parseCSV } from '@/lib/csv-parser';
import {
  detectDuplicates,
  getDuplicateStats,
  detectInternalDuplicates,
  type DuplicateCandidate,
  type InternalDuplicateCandidate,
} from '@/lib/duplicate-detector';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Transaction } from '@/types';

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (transactions: Transaction[]) => void;
  existingTransactions?: Transaction[];
  defaultUploadMode?: 'merge' | 'replace';
}

type UploadStep = 'select' | 'preview' | 'duplicates' | 'complete';

export function CSVUploadModal({
  open,
  onOpenChange,
  onUpload,
  existingTransactions = [],
  defaultUploadMode = 'merge',
}: CSVUploadModalProps) {
  const [step, setStep] = useState<UploadStep>('select');
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>(defaultUploadMode);
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [internalDuplicates, setInternalDuplicates] = useState<InternalDuplicateCandidate[]>([]);
  const [uniqueTransactions, setUniqueTransactions] = useState<Transaction[]>([]);
  const [skippedDuplicates, setSkippedDuplicates] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const reset = useCallback(() => {
    setStep('select');
    setParsedTransactions([]);
    setDuplicates([]);
    setInternalDuplicates([]);
    setUniqueTransactions([]);
    setSkippedDuplicates(new Set());
    setFileName('');
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      setError('');

      try {
        const text = await file.text();
        const transactions = parseCSV(text);
        setParsedTransactions(transactions);

        // Detect internal duplicates within the CSV
        const internalResult = detectInternalDuplicates(transactions);
        setInternalDuplicates(internalResult.internalDuplicates);

        setStep('preview');
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        console.error('Failed to parse CSV:', err);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handlePreviewContinue = useCallback(() => {
    if (uploadMode === 'replace') {
      // Skip duplicate detection for replace mode
      setUniqueTransactions(parsedTransactions);
      setDuplicates([]);
      setStep('complete');
    } else {
      // Detect duplicates for merge mode
      const result = detectDuplicates(parsedTransactions, existingTransactions);
      setUniqueTransactions(result.unique);
      setDuplicates(result.duplicates);

      if (result.duplicates.length > 0) {
        setStep('duplicates');
      } else {
        setStep('complete');
      }
    }
  }, [uploadMode, parsedTransactions, existingTransactions]);

  const handleSkipDuplicate = useCallback((id: string) => {
    setSkippedDuplicates((prev) => new Set([...prev, id]));
  }, []);

  const handleKeepDuplicate = useCallback((id: string) => {
    setSkippedDuplicates((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleSkipAll = useCallback(() => {
    setSkippedDuplicates(new Set(duplicates.map((d) => d.newTransaction.id)));
  }, [duplicates]);

  const handleComplete = useCallback(() => {
    // Get duplicates that weren't skipped
    const keptDuplicates = duplicates
      .filter((d) => !skippedDuplicates.has(d.newTransaction.id))
      .map((d) => d.newTransaction);

    const finalTransactions = [...uniqueTransactions, ...keptDuplicates];

    if (uploadMode === 'replace') {
      onUpload(finalTransactions);
    } else {
      // Merge: combine with existing
      onUpload([...existingTransactions, ...finalTransactions]);
    }

    handleClose();
  }, [duplicates, skippedDuplicates, uniqueTransactions, uploadMode, existingTransactions, onUpload, handleClose]);

  // Calculate stats for preview
  const previewStats = {
    count: parsedTransactions.length,
    total: parsedTransactions.reduce((sum, t) => sum + t.amount, 0),
    dateRange: parsedTransactions.length > 0 ? {
      start: new Date(Math.min(...parsedTransactions.map((t) => t.date.getTime()))),
      end: new Date(Math.max(...parsedTransactions.map((t) => t.date.getTime()))),
    } : null,
  };

  const duplicateStats = getDuplicateStats({ unique: uniqueTransactions, duplicates });
  const finalCount = uniqueTransactions.length + (duplicates.length - skippedDuplicates.size);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Select a CSV file to import transactions'}
            {step === 'preview' && 'Preview and configure your import'}
            {step === 'duplicates' && 'Review potential duplicate transactions'}
            {step === 'complete' && 'Ready to import'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 py-2">
          {(['select', 'preview', 'duplicates', 'complete'] as UploadStep[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['select', 'preview', 'duplicates', 'complete'].indexOf(step) > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    ['select', 'preview', 'duplicates', 'complete'].indexOf(step) > i
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: File Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
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

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">{fileName}</div>
                  <div className="text-sm text-muted-foreground">
                    {previewStats.count} transactions • {formatCurrency(previewStats.total)} total
                    {previewStats.dateRange && (
                      <>
                        {' '}
                        • {formatDate(previewStats.dateRange.start)} -{' '}
                        {formatDate(previewStats.dateRange.end)}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Internal duplicates warning */}
              {internalDuplicates.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-yellow-900 dark:text-yellow-100">
                        {internalDuplicates.length} Internal Duplicate{internalDuplicates.length !== 1 ? 's' : ''} Detected
                      </div>
                      <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        The uploaded CSV contains {internalDuplicates.length} duplicate transaction{internalDuplicates.length !== 1 ? 's' : ''} within the file itself.
                        {internalDuplicates.filter(d => d.isLegitimate).length > 0 && (
                          <span> {internalDuplicates.filter(d => d.isLegitimate).length} may be legitimate (e.g., subscriptions).</span>
                        )}
                      </div>
                      {/* Show first few internal duplicates */}
                      <div className="mt-2 space-y-2">
                        {internalDuplicates.slice(0, 3).map((dup, idx) => (
                          <div key={idx} className="text-xs bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
                            <div className="flex items-center gap-1 mb-1">
                              <Copy className="h-3 w-3" />
                              <span className="font-medium">{dup.transaction1.merchant}</span>
                              <Badge variant="outline" className="text-xs">
                                {dup.matchType}
                              </Badge>
                              {dup.isLegitimate && (
                                <Badge variant="outline" className="text-xs bg-green-500/10">
                                  May be legitimate
                                </Badge>
                              )}
                            </div>
                            <div className="text-yellow-700 dark:text-yellow-300">
                              {formatDate(dup.transaction1.date)} • {formatCurrency(dup.transaction1.amount)} (appears {2}x)
                            </div>
                          </div>
                        ))}
                        {internalDuplicates.length > 3 && (
                          <div className="text-xs text-yellow-700 dark:text-yellow-300">
                            And {internalDuplicates.length - 3} more internal duplicates...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">Upload Mode</div>
                  <div className="text-sm text-muted-foreground">
                    How to handle existing transactions
                  </div>
                </div>
                <Select value={uploadMode} onValueChange={(v: 'merge' | 'replace') => setUploadMode(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="replace">Replace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploadMode === 'merge' && existingTransactions.length > 0 && (
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  <strong>Merge mode:</strong> New transactions will be added to your existing{' '}
                  {existingTransactions.length} transactions. Duplicates will be detected.
                </div>
              )}

              {uploadMode === 'replace' && existingTransactions.length > 0 && (
                <div className="flex items-center gap-2 text-sm p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>Replace mode:</strong> All {existingTransactions.length} existing transactions
                  will be removed and replaced with the new data.
                </div>
              )}

              {/* Preview table */}
              <div>
                <div className="text-sm font-medium mb-2">Preview (first 5 transactions)</div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedTransactions.slice(0, 5).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{t.merchant}</TableCell>
                          <TableCell>
                            <Badge className={`${t.category.bgColor} ${t.category.textColor} border-0`}>
                              {t.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(t.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parsedTransactions.length > 5 && (
                  <div className="text-sm text-muted-foreground mt-2 text-center">
                    And {parsedTransactions.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Duplicates */}
          {step === 'duplicates' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">{duplicateStats.unique}</div>
                  <div className="text-sm text-muted-foreground">Unique</div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{duplicateStats.exact + duplicateStats.likely}</div>
                  <div className="text-sm text-muted-foreground">Duplicates</div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{finalCount}</div>
                  <div className="text-sm text-muted-foreground">To Import</div>
                </div>
              </div>

              {/* Skip all button */}
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleSkipAll}>
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip All Duplicates
                </Button>
              </div>

              {/* Duplicates list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {duplicates.map((dup) => {
                  const isSkipped = skippedDuplicates.has(dup.newTransaction.id);

                  return (
                    <div
                      key={dup.newTransaction.id}
                      className={`p-3 rounded-lg border ${isSkipped ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Copy className="h-4 w-4 text-yellow-600" />
                          <Badge
                            variant={dup.matchType === 'exact' ? 'destructive' : 'secondary'}
                          >
                            {dup.matchType === 'exact'
                              ? 'Exact Match'
                              : dup.matchType === 'likely'
                              ? 'Likely Duplicate'
                              : 'Possible Duplicate'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(dup.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSkipped ? (
                            <Button size="sm" variant="outline" onClick={() => handleKeepDuplicate(dup.newTransaction.id)}>
                              Keep
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleSkipDuplicate(dup.newTransaction.id)}>
                              Skip
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">New (from file)</div>
                          <div className="font-medium">{dup.newTransaction.merchant}</div>
                          <div className="text-muted-foreground">
                            {formatDate(dup.newTransaction.date)} • {formatCurrency(dup.newTransaction.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Existing</div>
                          <div className="font-medium">{dup.existingTransaction.merchant}</div>
                          <div className="text-muted-foreground">
                            {formatDate(dup.existingTransaction.date)} • {formatCurrency(dup.existingTransaction.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">Ready to Import</div>
                <div className="text-muted-foreground">
                  {finalCount} transaction{finalCount !== 1 ? 's' : ''} will be{' '}
                  {uploadMode === 'replace' ? 'imported' : 'added'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{finalCount}</div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      uniqueTransactions.reduce((sum, t) => sum + t.amount, 0) +
                        duplicates
                          .filter((d) => !skippedDuplicates.has(d.newTransaction.id))
                          .reduce((sum, d) => sum + d.newTransaction.amount, 0)
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step !== 'select' && step !== 'complete' && (
            <Button
              variant="outline"
              onClick={() => setStep(step === 'duplicates' ? 'preview' : 'select')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          {step === 'preview' && (
            <Button onClick={handlePreviewContinue}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {step === 'duplicates' && (
            <Button onClick={() => setStep('complete')}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {step === 'complete' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                <Check className="h-4 w-4 mr-1" />
                Import {finalCount} Transaction{finalCount !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
