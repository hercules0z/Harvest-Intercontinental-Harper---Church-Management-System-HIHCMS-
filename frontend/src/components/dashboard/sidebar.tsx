"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  HandCoins,
  LayoutDashboard,
  MessageSquare,
  type LucideIcon,
  Settings2,
  UsersRound,
  Wrench,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  iconRight?: string;
  children?: Array<{ label: string; href: string }>;
};

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, iconRight: "•" },
  {
    label: "Member Management",
    href: "/member-management",
    icon: UsersRound,
    children: [
      { label: "Member profiles", href: "/member-management#profiles" },
      { label: "Household grouping", href: "/member-management#households" },
      { label: "Baptism & membership status", href: "/member-management#baptism-membership-status" },
      { label: "Activity timeline", href: "/member-management#activity-timeline" },
      { label: "Member directory", href: "/member-management#directory" },
    ],
  },
  {
    label: "Departments",
    href: "/departments",
    icon: Building2,
    children: [
      { label: "Overview", href: "/departments" },
      { label: "Teams", href: "/departments#teams" },
    ],
  },
  {
    label: "Finance & Tithes",
    href: "/finance-tithes",
    icon: HandCoins,
    children: [
      { label: "Tithes & offerings", href: "/finance-tithes#tithes-offerings" },
      { label: "Fund categorization", href: "/finance-tithes#fund-categorization" },
      { label: "Recurring donations", href: "/finance-tithes#recurring-donations" },
      { label: "Online giving", href: "/finance-tithes#online-giving" },
      { label: "Contribution statements", href: "/finance-tithes#contribution-statements" },
      { label: "Financial reports", href: "/finance-tithes#financial-reports" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
    children: [
      { label: "Event creation", href: "/events#event-creation" },
      { label: "Registration", href: "/events#registration" },
      { label: "Capacity management", href: "/events#capacity-management" },
      { label: "Payment integration", href: "/events#payment-integration" },
      { label: "Attendance tracking", href: "/events#attendance-tracking" },
    ],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
    children: [
      { label: "Service attendance", href: "/attendance#service-attendance" },
      { label: "Event attendance", href: "/attendance#event-attendance" },
      { label: "Children check-in/out", href: "/attendance#children-checkin-out" },
      { label: "Attendance analytics", href: "/attendance#attendance-analytics" },
    ],
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: Briefcase,
    children: [
      { label: "Staff management", href: "/payroll#staff-management" },
      { label: "Salary configuration", href: "/payroll#salary-configuration" },
      { label: "Deductions & allowances", href: "/payroll#deductions-allowances" },
      { label: "Payslip generation", href: "/payroll#payslip-generation" },
    ],
  },
  {
    label: "Facilities",
    href: "/facilities",
    icon: Wrench,
    children: [
      { label: "Room booking", href: "/facilities#room-booking" },
      { label: "Equipment booking", href: "/facilities#equipment-booking" },
      { label: "Calendar management", href: "/facilities#calendar-management" },
    ],
  },
  {
    label: "Communication",
    href: "/communication",
    icon: MessageSquare,
    children: [
      { label: "Bulk SMS", href: "/communication#bulk-sms" },
      { label: "Bulk Email", href: "/communication#bulk-email" },
      { label: "Group messaging", href: "/communication#group-messaging" },
      { label: "Automated notifications", href: "/communication#automated-notifications" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    children: [
      { label: "Overview", href: "/reports" },
      { label: "Exports", href: "/reports#exports" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings2,
    children: [
      { label: "Overview", href: "/settings" },
      { label: "Preferences", href: "/settings#preferences" },
    ],
  },
];

function SidebarMenuItem({
  item,
  isOpen,
  pathname,
  activeLocation,
  onToggle,
}: {
  item: SidebarItem;
  isOpen: boolean;
  pathname: string;
  activeLocation: string;
  onToggle: () => void;
}) {
  const isActive = pathname === item.href;
  const hasChildren = !!item.children?.length;
  const isDashboard = item.href === "/dashboard";
  const ItemIcon = item.icon;

  return (
    <div>
      <div
        className={`flex min-h-[56px] w-full items-center justify-between rounded-2xl border px-3.5 py-2 text-left transition-colors ${
          isActive
            ? "border-purple-500 bg-purple-600 text-white"
            : "border-transparent bg-transparent text-purple-100 hover:border-purple-400/60 hover:bg-purple-700/40"
        }`}
      >
        <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={`grid h-7 w-7 place-items-center rounded-md border text-sm ${
              isActive
                ? "border-white/70 bg-white/15 text-white"
                : "border-purple-300/70 bg-purple-50/10 text-purple-100"
            }`}
          >
            <ItemIcon size={15} strokeWidth={2.2} />
          </span>
          <span className="max-w-[165px] text-[1.02rem] font-medium leading-[1.1] tracking-tight">{item.label}</span>
        </Link>

        {hasChildren ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={`Toggle ${item.label}`}
            className={`ml-2 flex h-6 w-6 items-center justify-center ${isActive ? "text-white" : "text-purple-200"}`}
          >
            {isOpen ? <ChevronUp size={16} strokeWidth={2.2} /> : <ChevronDown size={16} strokeWidth={2.2} />}
          </button>
        ) : (
          <span className={`text-sm leading-none ${isActive ? "text-white" : "text-purple-300"}`}>
            {isDashboard ? item.iconRight : isActive ? "●" : "⌄"}
          </span>
        )}
      </div>

      {hasChildren && isOpen ? (
        <div className="relative ml-10 mt-2 space-y-1.5 pl-4">
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-purple-300/70 via-purple-300/45 to-transparent"
          />

          {item.children?.map((child) => (
            <div key={child.href} className="group relative">
              {(() => {
                const [childPath] = child.href.split("#");
                const isChildActive = activeLocation === child.href || (child.href === childPath && pathname === childPath);

                return (
                  <>
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute left-[-9px] top-1/2 h-px w-3 -translate-y-1/2 ${
                        isChildActive ? "bg-purple-100" : "bg-purple-300/60"
                      }`}
                    />
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute left-[-1px] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                        isChildActive
                          ? "border-white bg-purple-100"
                          : "border-purple-200 bg-purple-600"
                      }`}
                    />

                    <Link
                      href={child.href}
                      data-sidebar-child-href={child.href}
                      className={`block rounded-lg border px-3 py-1.5 text-xs font-medium tracking-wide transition ${
                        isChildActive
                          ? "border-purple-100/80 bg-purple-600 text-white shadow-sm"
                          : "border-purple-300/40 bg-purple-800/50 text-purple-100 hover:border-purple-200/60 hover:bg-purple-700/65"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const defaultOpenMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of sidebarItems) {
      map[item.href] = pathname === item.href;
    }
    return map;
  }, [pathname]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(defaultOpenMap);

  useEffect(() => {
    setOpenMap((current) => ({
      ...current,
      [pathname]: true,
    }));
  }, [pathname]);

  useEffect(() => {
    function syncHash() {
      setActiveHash(window.location.hash || "");
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  const activeLocation = `${pathname}${activeHash}`;

  useEffect(() => {
    if (!activeLocation) {
      return;
    }

    const activeChildLink = document.querySelector(`[data-sidebar-child-href="${activeLocation}"]`);
    if (activeChildLink instanceof HTMLElement) {
      activeChildLink.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeLocation]);

  function handleToggle(href: string) {
    setOpenMap((current) => ({
      ...current,
      [href]: !current[href],
    }));
  }

  return (
    <aside className="w-[295px] shrink-0 border-r border-purple-300/30 bg-gradient-to-b from-purple-950 to-purple-900 p-3.5 text-white">
      <div className="rounded-2xl border border-purple-300/35 bg-purple-900/60 p-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-purple-300/40 bg-purple-950/30">
            <Image src="/harvest-logo.svg" alt="Harvest logo" width={34} height={34} priority />
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-purple-200">Harvest</p>
            <h2 className="mt-1 text-3xl font-bold leading-none tracking-tight">HICHMS</h2>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium leading-tight text-purple-100">Harvest Intercontinental Church</p>
        <p className="text-sm font-medium leading-tight text-purple-100">Harper Management System</p>
      </div>

      <nav className="mt-4 space-y-1.5">
        {sidebarItems.map((item) => (
          <SidebarMenuItem
            key={item.href}
            item={item}
            isOpen={!!openMap[item.href]}
            pathname={pathname}
            activeLocation={activeLocation}
            onToggle={() => handleToggle(item.href)}
          />
        ))}
      </nav>
    </aside>
  );
}
