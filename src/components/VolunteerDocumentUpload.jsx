import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, Trash2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const DOC_LABELS = {
  certification: "Certification",
  resume: "Resume / CV",
  identification: "Identification",
  other: "Other"
};

const DOC_COLORS = {
  certification: "bg-blue-100 text-blue-700",
  resume: "bg-green-100 text-green-700",
  identification: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-600"
};

export default function VolunteerDocumentUpload({ volunteerEmail }) {
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState("certification");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!volunteerEmail) return;
    base44.entities.VolunteerDocument.filter({ volunteer_email: volunteerEmail })
      .then(docs => { setDocuments(docs); setLoading(false); });
  }, [volunteerEmail]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const doc = await base44.entities.VolunteerDocument.create({
      volunteer_email: volunteerEmail,
      document_type: docType,
      file_name: file.name,
      file_url
    });
    setDocuments(prev => [...prev, doc]);
    toast.success("Document uploaded!");
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (doc) => {
    await base44.entities.VolunteerDocument.delete(doc.id);
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    toast.success("Document removed.");
  };

  return (
    <Card className="border-border mb-5">
      <CardHeader className="pb-3">
        <CardTitle className="font-fraunces text-lg flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> Documents
          <span className="text-xs font-normal text-muted-foreground ml-1">(visible to admins only)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload row */}
        <div className="flex gap-2 items-center">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="certification">Certification</SelectItem>
              <SelectItem value="resume">Resume / CV</SelectItem>
              <SelectItem value="identification">Identification</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex-1">
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Choose File"}
              </span>
            </Button>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Document list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name || "Document"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-xs border-0 px-1.5 py-0 ${DOC_COLORS[doc.document_type]}`}>
                        {DOC_LABELS[doc.document_type]}
                      </Badge>
                      {doc.created_date && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(doc.created_date), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary">
                      View
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}