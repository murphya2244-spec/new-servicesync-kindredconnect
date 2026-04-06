import { BADGES, getBadgeById } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Renders a row of earned badge icons.
 * @param {string[]} earnedBadgeIds - array of earned badge IDs
 * @param {string} size - "sm" | "md"
 * @param {number} max - max badges to show (0 = all)
 */
export default function BadgeDisplay({ earnedBadgeIds = [], size = "md", max = 0 }) {
  if (!earnedBadgeIds?.length) return null;

  const badges = earnedBadgeIds
    .map(id => getBadgeById(id))
    .filter(Boolean)
    .sort((a, b) => b.criteria.value - a.criteria.value); // highest value first

  const shown = max > 0 ? badges.slice(0, max) : badges;
  const overflow = max > 0 ? badges.length - max : 0;

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const containerSize = size === "sm" ? "w-5 h-5" : "w-7 h-7";

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 flex-wrap">
        {shown.map(badge => {
          const Icon = badge.icon;
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <span className={`inline-flex items-center justify-center rounded-full shrink-0 ${containerSize} ${badge.color}`}>
                  <Icon className={iconSize} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold text-xs">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {overflow > 0 && (
          <span className="text-xs text-muted-foreground font-medium">+{overflow}</span>
        )}
      </div>
    </TooltipProvider>
  );
}