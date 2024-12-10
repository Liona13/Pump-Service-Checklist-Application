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
      <DialogContent className="max-w-[95vw] w-full md:w-[1000px] h-[90vh] md:h-[95vh] p-0 shadow-2xl rounded-xl">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-gradient-to-b from-white to-gray-50/50">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            {language === 'en' ? 'Preview Document' : 'ดูตัวอย่างเอกสาร'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            {language === 'en' 
              ? 'Preview your pump service checklist before downloading.' 
              : 'ดูตัวอย่างรายการตรวจสอบการซ่อมบำรุงปั๊มก่อนดาวน์โหลด'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-4 sm:p-6 overflow-auto bg-gradient-to-b from-gray-50/30 to-white">
          {previewUrl ? (
            <div className="w-full h-[60vh] md:h-[70vh] border rounded-xl bg-white shadow-sm overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-[60vh] md:h-[70vh] border rounded-xl bg-white text-gray-600">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>{language === 'en' ? 'Loading preview...' : 'กำลังโหลดตัวอย่าง...'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-gradient-to-b from-gray-50/50 to-white">
          <div className="flex flex-col-reverse sm:flex-row justify-between w-full gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="w-full sm:w-auto shadow-sm hover:shadow transition-all hover:bg-gray-50"
            >
              {language === 'en' ? 'Close' : 'ปิด'}
            </Button>
            <Button 
              onClick={onDownload} 
              className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
            >
              {language === 'en' ? 'Download PDF' : 'ดาวน์โหลด PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 