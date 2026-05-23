import { User, Bell, Scale, Moon, Info, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Settings() {
  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-8 mt-4">Settings</h2>

      <div className="flex flex-col gap-2">
        {/* Profile */}
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" data-testid="settings-profile">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
            </Avatar>
            <span className="font-medium text-lg">Profile</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </div>

        {/* Notifications */}
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between" data-testid="settings-notifications">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg text-foreground">
              <Bell size={20} />
            </div>
            <span className="font-medium">Notifications</span>
          </div>
          <Switch checked={true} />
        </div>

        {/* Units */}
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" data-testid="settings-units">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg text-foreground">
              <Scale size={20} />
            </div>
            <span className="font-medium">Units</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">kg</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" data-testid="settings-theme">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg text-foreground">
              <Moon size={20} />
            </div>
            <span className="font-medium">Theme</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dark</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </div>

        {/* About */}
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform mt-4" data-testid="settings-about">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg text-foreground">
              <Info size={20} />
            </div>
            <span className="font-medium">About Peppies</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
