import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Sparkles, FileText, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProfileAutoFill({ onExtracted }) {
  const [open, setOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState("file"); // "file" | "text"

  const runExtraction = async ({ file_url, text_input }) => {
    const res = await base44.functions.invoke("extractVolunteerProfile", { file_url, text_input });
    const { extracted } = res.data;
    if (extracted && Object.keys(extracted).length > 0) {
      onExtracted(extracted);
      toast.success("Profile info extracted! Review and edit below.");
    } else {
      toast.error("Couldn't extract info. Please fill in manually.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await runExtraction({ file_url });
    setUploading(false);
    e.target.value = "";
  };

  const handleTextExtract = async () => {
    if (!textInput.trim()) return;
    setUploading(true);
    await runExtraction({ text_input: textInput });
    setUploading(false);
  };

  return (
    <Card className="border-primary/30 bg-primary/5 mb-5">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <CardTitle className="font-fraunces text-base flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Auto-Fill Profile
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload your resume or paste a short description — AI will extract your contact info, skills, education, and work experience.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "file" ? "default" : "outline"}
              onClick={() => setMode("file")}
              className="text-xs"
            >
              Upload File
            </Button>
            <Button
              size="sm"
              variant={mode === "text" ? "default" : "outline"}
              onClick={() => setMode("text")}
              className="text-xs"
            >
              Paste Text
            </Button>
          </div>

          {mode === "file" ? (
            <div className="flex items-center gap-3">
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
                        Upload Resume / CV
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
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  {fileName}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Paste your bio, resume summary, LinkedIn about section, or any background info..."
                className="h-28 resize-none text-sm"
                disabled={uploading}
              />
              <Button
                onClick={handleTextExtract}
                disabled={!textInput.trim() || uploading}
                className="gap-2 bg-primary hover:bg-primary/90"
                size="sm"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Extract Info
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}