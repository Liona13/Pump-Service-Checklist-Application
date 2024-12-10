import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  language: 'en' | 'th';
  previewUrl: string | null;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  onDownload,
  language,
  previewUrl,
}: PDFPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl">
            {language === 'en' ? 'Preview Document' : 'ดูตัวอย่างเอกสาร'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {language === 'en' 
              ? 'Preview your pump service checklist before downloading.' 
              : 'ดูตัวอย่างรายการตรวจสอบการซ่อมบำรุงปั๊มก่อนดาวน์โหลด'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-auto min-h-0">
          <div className="h-full border rounded-lg bg-gray-50">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {language === 'en' ? 'Loading preview...' : 'กำลังโหลดตัวอย่าง...'}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t mt-auto shrink-0">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              {language === 'en' ? 'Close' : 'ปิด'}
            </Button>
            <Button onClick={onDownload}>
              {language === 'en' ? 'Download PDF' : 'ดาวน์โหลด PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 