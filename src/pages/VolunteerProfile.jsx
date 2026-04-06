import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Phone, Briefcase, Clock, Plus, X, Save, GraduationCap, Building2, MapPin, Heart, Medal } from "lucide-react";
import { BADGES } from "@/lib/badges";
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
import ProfileAutoFill from "@/components/ProfileAutoFill";

const SKILL_SUGGESTIONS = [
  "First Aid", "Teaching", "Cooking", "Driving", "Spanish", "French",
  "Construction", "Photography", "Fundraising", "Social Media", "Counseling", "Coding"
];

const emptyEdu = { institution: "", degree: "", field: "", year: "" };
const emptyWork = { company: "", title: "", duration: "", description: "" };

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    bio: "", phone: "", address: "", skills: [], availability: "",
    education: [], work_experience: [],
    work_environment_preference: [],
    interaction_type_preference: []
  });
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
        address: me.address || "",
        skills: me.skills || [],
        availability: me.availability || "",
        education: me.education || [],
        work_experience: me.work_experience || [],
        work_environment_preference: me.work_environment_preference || [],
        interaction_type_preference: me.interaction_type_preference || []
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleExtracted = (data) => {
    setForm(prev => ({
      ...prev,
      bio: data.bio || prev.bio,
      phone: data.phone || prev.phone,
      address: data.address || prev.address,
      availability: data.availability || prev.availability,
      skills: data.skills?.length ? [...new Set([...prev.skills, ...data.skills])] : prev.skills,
      education: data.education?.length ? data.education : prev.education,
      work_experience: data.work_experience?.length ? data.work_experience : prev.work_experience
    }));
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const updateEdu = (i, key, val) =>
    setForm(prev => {
      const edu = [...prev.education];
      edu[i] = { ...edu[i], [key]: val };
      return { ...prev, education: edu };
    });

  const removeEdu = (i) =>
    setForm(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  const updateWork = (i, key, val) =>
    setForm(prev => {
      const work = [...prev.work_experience];
      work[i] = { ...work[i], [key]: val };
      return { ...prev, work_experience: work };
    });

  const removeWork = (i) =>
    setForm(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.User.update(user.id, {
      bio: form.bio,
      phone: form.phone,
      address: form.address,
      skills: form.skills,
      availability: form.availability,
      education: form.education,
      work_experience: form.work_experience,
      work_environment_preference: form.work_environment_preference,
      interaction_type_preference: form.interaction_type_preference
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

        <Card className="border-border mb-5">
          <CardContent className="p-6 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profile_image_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-fraunces font-semibold">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs">Volunteer</Badge>
            </div>
          </CardContent>
        </Card>

        <ProfileAutoFill onExtracted={handleExtracted} />

        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself and why you volunteer..." className="h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="City, State" className="pl-9" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..."
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))} />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
                <button key={s} onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-secondary transition-colors text-muted-foreground">
                  + {s}
                </button>
              ))}
            </div>
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

        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.education.map((edu, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 relative">
                <button onClick={() => removeEdu(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Institution" value={edu.institution} onChange={e => updateEdu(i, "institution", e.target.value)} />
                  <Input placeholder="Degree (e.g. B.Sc.)" value={edu.degree} onChange={e => updateEdu(i, "degree", e.target.value)} />
                  <Input placeholder="Field of Study" value={edu.field} onChange={e => updateEdu(i, "field", e.target.value)} />
                  <Input placeholder="Year (e.g. 2020)" value={edu.year} onChange={e => updateEdu(i, "year", e.target.value)} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => setForm(p => ({ ...p, education: [...p.education, { ...emptyEdu }] }))}>
              <Plus className="w-3.5 h-3.5" /> Add Education
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.work_experience.map((job, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 relative">
                <button onClick={() => removeWork(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Company" value={job.company} onChange={e => updateWork(i, "company", e.target.value)} />
                  <Input placeholder="Job Title" value={job.title} onChange={e => updateWork(i, "title", e.target.value)} />
                  <Input placeholder="Duration (e.g. 2019–2022)" value={job.duration}
                    onChange={e => updateWork(i, "duration", e.target.value)} className="col-span-2" />
                </div>
                <Textarea placeholder="Brief description of role..." value={job.description}
                  onChange={e => updateWork(i, "description", e.target.value)} className="resize-none h-16 text-sm" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => setForm(p => ({ ...p, work_experience: [...p.work_experience, { ...emptyWork }] }))}>
              <Plus className="w-3.5 h-3.5" /> Add Work Experience
            </Button>
          </CardContent>
        </Card>

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

        {/* Volunteer Preferences */}
        <Card className="border-border mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" /> Volunteer Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Work Environment</Label>
              <p className="text-xs text-muted-foreground">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "indoor", label: "🏠 Indoor" },
                  { value: "outdoor", label: "🌿 Outdoor" },
                  { value: "hybrid", label: "🔄 Both / Hybrid" }
                ].map(({ value, label }) => {
                  const selected = form.work_environment_preference.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        work_environment_preference: selected
                          ? p.work_environment_preference.filter(v => v !== value)
                          : [...p.work_environment_preference, value]
                      }))}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selected
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Interaction Style</Label>
              <p className="text-xs text-muted-foreground">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "high_social", label: "🤝 High Social" },
                  { value: "low_social", label: "🤫 Low Social" },
                  { value: "independent", label: "🧍 Independent" },
                  { value: "team_based", label: "👥 Team-Based" }
                ].map(({ value, label }) => {
                  const selected = form.interaction_type_preference.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        interaction_type_preference: selected
                          ? p.interaction_type_preference.filter(v => v !== value)
                          : [...p.interaction_type_preference, value]
                      }))}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selected
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        {user?.badges_earned?.length > 0 && (
          <Card className="border-border mb-5">
            <CardHeader className="pb-3">
              <CardTitle className="font-fraunces text-lg flex items-center gap-2">
                <Medal className="w-4 h-4 text-primary" /> My Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.filter(b => user.badges_earned.includes(b.id)).map(badge => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border ${badge.color.split(" ")[1]}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${badge.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{badge.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <VolunteerDocumentUpload volunteerEmail={user?.email} />

        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </AppLayout>
  );
}