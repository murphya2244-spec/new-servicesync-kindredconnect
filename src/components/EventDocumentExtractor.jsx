import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Sparkles, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EventDocumentExtractor({ onExtracted }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [open, setOpen] = useState(true);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const response = await base44.functions.invoke("extractEventDocument", { file_url });
    const { extracted } = response.data;
    if (extracted && Object.keys(extracted).length > 0) {
      onExtracted(extracted);
      toast.success("Details extracted! Review and edit below.");
    } else {
      toast.error("Could not extract details from this document. Please fill in manually.");
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <Card className="border-primary/30 bg-primary/5 mb-5">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <CardTitle className="font-fraunces text-base flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Auto-fill from Document
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            Upload an event plan, venue contract, or marketing brief — we'll extract and pre-fill the form fields automatically.
          </p>
          <label>
            <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </span>
            </Button>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              disabled={uploading}
            />
          </label>
          {fileName && !uploading && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              {fileName}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}