import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Clock, Briefcase } from "lucide-react";

export default function VolunteerProfileDrawer({ volunteer, open, onOpenChange }) {
  if (!volunteer) return null;

  const initials = volunteer.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 sm:w-96">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-fraunces">Volunteer Profile</SheetTitle>
        </SheetHeader>

        {/* Identity */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={volunteer.profile_image_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-fraunces font-semibold">{volunteer.full_name}</p>
            <p className="text-sm text-muted-foreground">{volunteer.email}</p>
            <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs capitalize">
              {volunteer.role || "volunteer"}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {volunteer.bio && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-foreground leading-relaxed">{volunteer.bio}</p>
            </div>
          )}

          {volunteer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>{volunteer.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span>{volunteer.email}</span>
          </div>

          {volunteer.availability && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="capitalize">{volunteer.availability}</span>
            </div>
          )}

          {volunteer.skills?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Skills</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {volunteer.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}