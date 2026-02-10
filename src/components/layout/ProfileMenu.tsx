/**
 * ProfileMenu Component
 * Dropdown menu triggered by user profile avatar
 * Located at bottom of sidebar
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileMenuProps {
  isCollapsed: boolean;
}

export const ProfileMenu = ({ isCollapsed }: ProfileMenuProps) => {
  // DEMO DATA: Hardcoded profile for demo purposes
  const profile = {
    name: "Sarah Lusinamio",
    role: "Music Supervisor",
    avatar: "/flower.png", // Path to avatar image in /public folder
    initials: "SL",        // Fallback initials if image doesn't load
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            /* CONTAINER: Flex layout for avatar + text */
            flex items-center gap-3 w-full

            /* PADDING: Comfortable click area */
            p-3

            /* BORDER & SHAPE: Rounded corners */
            rounded-lg

            /* COLORS: Subtle background on hover */
            hover:bg-accent/10

            /* ANIMATION: Smooth color transition */
            transition-colors duration-200

            /* FOCUS: Accessible outline for keyboard nav */
            focus:outline-none focus:ring-2 focus:ring-accent
          `}
        >
          {/* AVATAR: Profile picture */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {profile.initials}
            </AvatarFallback>
          </Avatar>

          {/* TEXT: Name and role (hidden when sidebar is collapsed) */}
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              {/* NAME: Primary text */}
              <div className="text-sm font-medium text-foreground truncate">
                {profile.name}
              </div>

              {/* ROLE: Secondary text */}
              <div className="text-xs text-muted-foreground truncate">
                {profile.role}
              </div>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* DROPDOWN MENU: Settings, Profile, Sign Out */}
      <DropdownMenuContent
        align="end"
        className={`
          /* WIDTH: Fixed menu width */
          w-56

          /* COLORS: Match sidebar theme */
          bg-card border-border
        `}
      >
        {/* MENU ITEM: Settings (cosmetic only for demo) */}
        <DropdownMenuItem className="cursor-pointer">
          Settings
        </DropdownMenuItem>

        {/* MENU ITEM: Profile (cosmetic only for demo) */}
        <DropdownMenuItem className="cursor-pointer">
          Profile
        </DropdownMenuItem>

        {/* SEPARATOR: Visual divider */}
        <DropdownMenuSeparator />

        {/* MENU ITEM: Sign Out (cosmetic only for demo) */}
        <DropdownMenuItem className="cursor-pointer text-destructive">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
