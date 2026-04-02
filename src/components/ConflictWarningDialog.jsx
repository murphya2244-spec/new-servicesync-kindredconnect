import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConflictWarningDialog({ open, onOpenChange, conflicts, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fraunces">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Scheduling Conflict
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This event overlaps with events you've already signed up for:</p>
          <ul className="space-y-1 mt-2">
            {conflicts.map((c, i) => (
              <li key={i} className="flex items-center gap-2 bg-yellow-50 text-yellow-800 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">{c.title}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1">Do you still want to sign up?</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            Sign Up Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}