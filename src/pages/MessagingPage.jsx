import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Hash, Users, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

export default function MessagingPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChannel, setActiveChannel] = useState({ id: "general", label: "General", type: "group" });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, vols] = await Promise.all([
        base44.entities.Event.filter({ status: "upcoming" }, "date", 20),
        base44.entities.User.list()
      ]);
      setEvents(evs);
      setVolunteers(vols.filter(v => v.email !== me.email));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    const fetchMessages = async () => {
      const msgs = await base44.entities.Message.filter({ channel: activeChannel.id }, "created_date", 100);
      setMessages(msgs);
    };
    fetchMessages();

    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.channel === activeChannel.id) {
        if (event.type === "create") setMessages(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, [activeChannel?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    await base44.entities.Message.create({
      channel: activeChannel.id,
      channel_label: activeChannel.label,
      sender_email: user.email,
      sender_name: user.full_name,
      content: input.trim(),
      message_type: activeChannel.type
    });
    setInput("");
    setSending(false);
  };

  const getDirectChannelId = (otherEmail) => {
    const emails = [user.email, otherEmail].sort();
    return `direct:${emails[0]}:${emails[1]}`;
  };

  const channels = [
    { id: "general", label: "General", type: "group", icon: Hash },
    ...events.map(e => ({ id: `event:${e.id}`, label: e.title, type: "group", icon: Users }))
  ];

  const directChannels = volunteers.map(v => ({
    id: getDirectChannelId(v.email),
    label: v.full_name || v.email,
    type: "direct",
    icon: MessageSquare,
    email: v.email
  }));

  if (loading) return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-fraunces font-semibold mb-6">Messages</h1>
        <div className="flex gap-4 h-[600px]">
          {/* Sidebar */}
          <div className="w-56 shrink-0 bg-card border border-border rounded-xl overflow-y-auto">
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Channels</p>
              {channels.map(ch => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors",
                      activeChannel.id === ch.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 mt-4">Direct</p>
              {directChannels.length === 0 && (
                <p className="text-xs text-muted-foreground px-2">No other users yet.</p>
              )}
              {directChannels.map(ch => {
                const initials = ch.label.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors",
                      activeChannel.id === ch.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[9px] bg-muted">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-medium text-sm">{activeChannel.label}</span>
              <span className="text-xs text-muted-foreground capitalize">· {activeChannel.type}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_email === user?.email;
                const initials = (msg.sender_name || msg.sender_email).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div key={msg.id || i} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                      <AvatarFallback className={`text-xs ${isMe ? "bg-primary/10 text-primary" : "bg-muted"}`}>{initials}</AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      {!isMe && <p className="text-xs text-muted-foreground px-1">{msg.sender_name || msg.sender_email}</p>}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={`Message ${activeChannel.label}...`}
                className="flex-1"
                disabled={sending}
              />
              <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}