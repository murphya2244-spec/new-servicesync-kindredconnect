import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import EventDocumentExtractor from "@/components/EventDocumentExtractor";

const defaultForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  capacity: "",
  status: "upcoming",
  category: "other",
  image_url: "",
  skills_needed: [],
  event_environment: "",
  event_interaction_level: ""
};

export default function AdminEventForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Check if editing existing event
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = window.location.pathname.split("/").pop();
  const isEdit = eventId && eventId !== "new";

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (isEdit) {
        const evs = await base44.entities.Event.filter({ id: eventId });
        if (evs[0]) {
          const e = evs[0];
          setForm({
            title: e.title || "",
            description: e.description || "",
            date: e.date || "",
            time: e.time || "",
            location: e.location || "",
            capacity: e.capacity || "",
            status: e.status || "upcoming",
            category: e.category || "other",
            image_url: e.image_url || "",
            skills_needed: e.skills_needed || [],
            event_environment: e.event_environment || "",
            event_interaction_level: e.event_interaction_level || ""
          });
        }
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
    let savedId = eventId;
    if (isEdit) {
      await base44.entities.Event.update(eventId, data);
    } else {
      const created = await base44.entities.Event.create(data);
      savedId = created.id;
    }
    // Scan volunteer pool for matches, flag as unfilled if needed, notify top matches
    base44.functions.invoke('scanVolunteersForEvent', { event_id: savedId }).catch(() => {});
    navigate("/admin/events");
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSkill = (s) => {
    const skill = s.trim();
    if (!skill || form.skills_needed.includes(skill)) return;
    set("skills_needed", [...form.skills_needed, skill]);
    setSkillInput("");
  };
  const removeSkill = (skill) => set("skills_needed", form.skills_needed.filter(s => s !== skill));

  return (
    <AppLayout role="admin" user={user}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-fraunces font-semibold">
              {isEdit ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-muted-foreground text-sm">Fill in the event details below</p>
          </div>
        </div>

        <EventDocumentExtractor onExtracted={(data) => setForm(prev => ({ ...prev, ...data, capacity: data.capacity ? String(data.capacity) : prev.capacity }))} />

        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Event Title *</Label>
                <Input id="title" value={form.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. Community Garden Day" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell volunteers what to expect..." className="h-28 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={form.time} onChange={e => set("time", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Address or venue name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community_outreach">Community Outreach</SelectItem>
                      <SelectItem value="food_bank">Food Bank</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="animal_welfare">Animal Welfare</SelectItem>
                      <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity">Volunteer Capacity</Label>
                  <Input id="capacity" type="number" min="1" value={form.capacity} onChange={e => set("capacity", e.target.value)} placeholder="e.g. 20" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image_url">Banner Image URL</Label>
                <Input id="image_url" value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="event_environment">Work Environment</Label>
                  <Select value={form.event_environment || ""} onValueChange={v => set("event_environment", v)}>
                    <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">🏠 Indoor</SelectItem>
                      <SelectItem value="outdoor">🌿 Outdoor</SelectItem>
                      <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="event_interaction_level">Interaction Style</Label>
                  <Select value={form.event_interaction_level || ""} onValueChange={v => set("event_interaction_level", v)}>
                    <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_social">🤝 High Social</SelectItem>
                      <SelectItem value="low_social">🤫 Low Social</SelectItem>
                      <SelectItem value="independent">🧍 Independent</SelectItem>
                      <SelectItem value="team_based">👥 Team-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Skills Needed</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                    placeholder="e.g. First Aid, Driving..."
                  />
                  <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.skills_needed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.skills_needed.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}