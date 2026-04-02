import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import AppLayout from "@/components/AppLayout";

const categoryColors = {
  community_outreach: "bg-orange-400",
  food_bank: "bg-yellow-400",
  environmental: "bg-green-500",
  education: "bg-blue-400",
  healthcare: "bg-red-400",
  animal_welfare: "bg-purple-400",
  disaster_relief: "bg-gray-400",
  other: "bg-primary"
};

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [mySignupIds, setMySignupIds] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, sups] = await Promise.all([
        base44.entities.Event.list("date"),
        base44.entities.Signup.filter({ volunteer_email: me.email })
      ]);
      setEvents(evs);
      setMySignupIds(new Set(sups.filter(s => s.status !== "cancelled").map(s => s.event_id)));
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = user?.role === "admin";

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const eventsForDay = (day) =>
    events.filter(e => e.date && isSameDay(parseISO(e.date), day));

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];

  if (loading) return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role={isAdmin ? "admin" : "volunteer"} user={user}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">Calendar</h1>
          <p className="text-muted-foreground">All volunteer events at a glance</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-fraunces font-semibold text-lg">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayEvents = eventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-border cursor-pointer transition-colors
                    ${!inMonth ? "bg-muted/30" : "hover:bg-muted/40"}
                    ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : ""}
                  `}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm mb-1 font-medium
                    ${isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground"}
                  `}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-xs px-1 py-0.5 rounded truncate text-white font-medium ${categoryColors[ev.category] || "bg-primary"}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day event details */}
        {selectedDay && (
          <div className="mt-6">
            <h3 className="font-fraunces font-semibold text-lg mb-3">
              {format(selectedDay, "MMMM d, yyyy")}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}
              </span>
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events on this day.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedDayEvents.map(ev => {
                  const joined = mySignupIds.has(ev.id);
                  return (
                    <div key={ev.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryColors[ev.category] || "bg-primary"}`} />
                          <p className="font-medium text-sm truncate">{ev.title}</p>
                        </div>
                        {ev.time && <p className="text-xs text-muted-foreground">{ev.time}</p>}
                        {ev.location && <p className="text-xs text-muted-foreground truncate">{ev.location}</p>}
                        {joined && <Badge className="mt-1 bg-accent/10 text-accent border-0 text-xs">Joined</Badge>}
                      </div>
                      <Link to={isAdmin ? `/admin/events/${ev.id}` : `/events/${ev.id}`}>
                        <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs">View</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}