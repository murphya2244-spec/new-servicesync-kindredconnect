import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Phone, Briefcase, Clock, Plus, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import VolunteerDocumentUpload from "@/components/VolunteerDocumentUpload";

const SKILL_SUGGESTIONS = [
  "First Aid", "Teaching", "Cooking", "Driving", "Spanish", "French",
  "Construction", "Photography", "Fundraising", "Social Media", "Counseling", "Coding"
];

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ bio: "", phone: "", skills: [], availability: "" });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      setForm({
        bio: me.bio || "",
        phone: me.phone || "",
        skills: me.skills || [],
        availability: me.availability || ""
      });
      setLoading(false);
    };
    load();
  }, []);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.User.update(user.id, {
      bio: form.bio,
      phone: form.phone,
      skills: form.skills,
      availability: form.availability
    });
    setSaving(false);
    toast.success("Profile updated!");
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return (
    <AppLayout role="volunteer" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="volunteer" user={user}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">My Profile</h1>
          <p className="text-muted-foreground">Manage your volunteer information</p>
        </div>

        {/* Avatar / Identity */}
        <Card className="border-border mb-5">
          <CardContent className="p-6 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profile_image_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-fraunces font-semibold">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs">Volunteer</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Editable Info */}
        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> About You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself and why you volunteer..."
                className="h-24 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
              />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-secondary transition-colors text-muted-foreground"
                >
                  + {s}
                </button>
              ))}
            </div>
            {/* Current skills */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.skills.map(skill => (
                  <Badge key={skill} className="bg-primary/10 text-primary border-0 gap-1 pr-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-destructive ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={form.availability} onValueChange={v => setForm(p => ({ ...p, availability: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="When are you generally available?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="both">Weekdays & Weekends</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Documents */}
        <VolunteerDocumentUpload volunteerEmail={user?.email} />

        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </AppLayout>
  );
}