import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Home,
  PlusCircle,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useAppStore } from "../stores/appStore";
import type { UserRole } from "../types";
import { UserAvatar } from "./UserAvatar";

interface LayoutProps {
  children: React.ReactNode;
}

const ROLE_LABELS: Record<UserRole, string> = {
  homeowner: "Homeowner",
  worker: "Worker",
  enterprise: "Enterprise",
};

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, logout, principalText } = useAuth();
  const { unreadCount } = useNotifications();
  const { currentRole, availableRoles, setCurrentRole } = useAppStore();
  const location = useLocation();

  const isLanding = location.pathname === "/";

  const navItems =
    currentRole === "homeowner"
      ? [
          { to: "/homeowner/dashboard", label: "Dashboard", icon: Home },
          { to: "/homeowner/post-job", label: "Post Job", icon: PlusCircle },
        ]
      : currentRole === "worker"
        ? [{ to: "/worker/dashboard", label: "Find Jobs", icon: Briefcase }]
        : [{ to: "/enterprise/dashboard", label: "Dispatch", icon: Zap }];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border shadow-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Pluber
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && !isLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Role switcher */}
                {availableRoles.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 hidden md:flex"
                        data-ocid="role-switcher"
                      >
                        {ROLE_LABELS[currentRole]}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableRoles.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => setCurrentRole(role)}
                          className={currentRole === role ? "bg-secondary" : ""}
                        >
                          {ROLE_LABELS[role]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Notifications */}
                <Link to="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    data-ocid="nav-notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-ocid="nav-profile"
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                    >
                      <UserAvatar name={principalText?.slice(0, 8)} size="sm" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {principalText && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono truncate">
                        {principalText.slice(0, 20)}…
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/onboarding" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                      data-ocid="nav-logout"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login">
                <Button
                  variant="default"
                  size="sm"
                  data-ocid="nav-login"
                  className="btn-accent"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Mobile Bottom Nav */}
      {isAuthenticated && !isLanding && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 safe-area-bottom">
          <div className="flex items-stretch h-16">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="flex-1">
                {({ isActive }) => (
                  <div
                    className={`flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-smooth ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                )}
              </Link>
            ))}
            <Link to="/notifications" className="flex-1">
              {({ isActive }) => (
                <div
                  className={`flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-smooth relative ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-ocid="mobile-nav-notifications"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] bg-accent text-accent-foreground rounded-full font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Alerts</span>
                </div>
              )}
            </Link>
          </div>
        </nav>
      )}

      {/* Footer */}
      {(isLanding || !isAuthenticated) && (
        <footer className="bg-card border-t border-border py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-display font-semibold text-foreground">
                Pluber
              </span>
            </div>
            <p>
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-smooth"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
