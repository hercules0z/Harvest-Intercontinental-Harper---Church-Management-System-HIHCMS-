"use client";

import { DashboardContentShell } from "@/components/dashboard/content-shell";
import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  CircleOff,
  CircleUserRound,
  FolderTree,
  ListChecks,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api-client";

const memberSections = [
  {
    id: "profiles",
    title: "Member profiles",
    description: "Create and maintain personal records, contact details, and core demographic information.",
    icon: Users,
    status: "Ready for configuration",
  },
  {
    id: "households",
    title: "Household grouping",
    description: "Organize members by family units to improve pastoral care and communication tracking.",
    icon: FolderTree,
    status: "Ready for configuration",
  },
  {
    id: "baptism-membership-status",
    title: "Baptism & membership status",
    description: "Track baptism milestones, membership stage, and verification updates in one place.",
    icon: BadgeCheck,
    status: "Ready for configuration",
  },
  {
    id: "ministry-assignments",
    title: "Ministry assignments",
    description: "Assign members to departments and ministries with role visibility for leaders.",
    icon: ListChecks,
    status: "Ready for configuration",
  },
  {
    id: "activity-timeline",
    title: "Activity timeline",
    description: "Review historical participation and key events connected to each member record.",
    icon: Activity,
    status: "Ready for configuration",
  },
  {
    id: "directory",
    title: "Member directory",
    description: "Browse the complete member list for quick access, review, and follow-up actions.",
    icon: ShieldCheck,
    status: "Ready for configuration",
  },
];

const membershipLifecycleFlow = [
  "Visitor",
  "Follow-up",
  "Membership Class",
  "Active Member",
  "Inactive/Archived",
];

const editableMemberSections = [
  {
    id: "households",
    title: "Household grouping",
    icon: FolderTree,
    placeholder: "Enter household information (family name, head of household, relationships, contact notes)...",
  },
  {
    id: "baptism-membership-status",
    title: "Baptism & membership status",
    icon: BadgeCheck,
    placeholder: "Record baptism date, membership class progress, status updates, and verification notes...",
  },
  {
    id: "ministry-assignments",
    title: "Ministry assignments",
    icon: ListChecks,
    placeholder: "Add ministry roles, department assignments, service schedules, and leader comments...",
  },
  {
    id: "activity-timeline",
    title: "Activity timeline",
    icon: Activity,
    placeholder: "Track attendance trends, pastoral follow-ups, events attended, and key milestones...",
  },
] as const;

type MemberSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: string;
};

type Member = {
  id: number;
  full_name: string;
  phone: string;
  ministry: string;
  department: string;
  email: string;
  gender: string;
  address: string;
  is_active: boolean;
  created_at: string;
};

type MemberListResponse =
  | Member[]
  | {
      results: Member[];
    };

type DepartmentOption = {
  id: number;
  name: string;
};

type DepartmentOptionListResponse =
  | DepartmentOption[]
  | {
      results: DepartmentOption[];
    };

type MemberFormState = {
  full_name: string;
  phone: string;
  ministry: string;
  department: string;
  email: string;
  gender: string;
  address: string;
};

type MemberSectionNotesResponse = {
  households: string;
  baptism_membership_status: string;
  ministry_assignments: string;
  activity_timeline: string;
  updated_at: string;
};

const initialFormState: MemberFormState = {
  full_name: "",
  phone: "",
  ministry: "",
  department: "",
  email: "",
  gender: "",
  address: "",
};

const sectionApiFieldById: Record<string, keyof Omit<MemberSectionNotesResponse, "updated_at">> = {
  households: "households",
  "baptism-membership-status": "baptism_membership_status",
  "ministry-assignments": "ministry_assignments",
  "activity-timeline": "activity_timeline",
};

function extractMembers(payload: MemberListResponse): Member[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

function extractDepartmentOptions(payload: DepartmentOptionListResponse): DepartmentOption[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

function MemberSectionCard({ section }: { section: MemberSection }) {
  const SectionIcon = section.icon;

  return (
    <article
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm transition-colors hover:border-purple-300"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-purple-300 bg-purple-50 text-purple-700">
            <SectionIcon size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">{section.status}</p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
        >
          Open Section
        </button>
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>
    </article>
  );
}

export default function MemberManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [quickAddName, setQuickAddName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState<MemberFormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [sectionInputs, setSectionInputs] = useState<Record<string, string>>({
    households: "",
    "baptism-membership-status": "",
    "ministry-assignments": "",
    "activity-timeline": "",
  });
  const [isLoadingSectionInputs, setIsLoadingSectionInputs] = useState(false);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [sectionMessages, setSectionMessages] = useState<Record<string, string>>({});

  async function loadMembers() {
    setIsLoadingMembers(true);
    try {
      const payload = await apiRequest<MemberListResponse>("/members/");
      setMembers(extractMembers(payload));
    } catch {
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }

  async function loadDepartmentOptions() {
    setIsLoadingDepartments(true);
    try {
      const payload = await apiRequest<DepartmentOptionListResponse>("/departments/");
      const normalized = extractDepartmentOptions(payload)
        .filter((department) => department.name?.trim())
        .sort((left, right) => left.name.localeCompare(right.name));
      setDepartmentOptions(normalized);
    } catch {
      setDepartmentOptions([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  }

  async function loadSectionInputs() {
    setIsLoadingSectionInputs(true);
    try {
      const payload = await apiRequest<MemberSectionNotesResponse>("/members/section-notes/");
      setSectionInputs({
        households: payload.households ?? "",
        "baptism-membership-status": payload.baptism_membership_status ?? "",
        "ministry-assignments": payload.ministry_assignments ?? "",
        "activity-timeline": payload.activity_timeline ?? "",
      });
    } catch {
      setSectionInputs({
        households: "",
        "baptism-membership-status": "",
        "ministry-assignments": "",
        "activity-timeline": "",
      });
    } finally {
      setIsLoadingSectionInputs(false);
    }
  }

  useEffect(() => {
    loadMembers();
    loadDepartmentOptions();
    loadSectionInputs();
  }, []);

  async function handleSaveSectionInput(sectionId: string) {
    const fieldName = sectionApiFieldById[sectionId];
    if (!fieldName) {
      return;
    }

    setSavingSectionId(sectionId);
    setSectionMessages((current) => ({ ...current, [sectionId]: "" }));

    try {
      await apiRequest<MemberSectionNotesResponse>("/members/section-notes/", {
        method: "PATCH",
        body: JSON.stringify({
          [fieldName]: sectionInputs[sectionId] ?? "",
        }),
      });

      setSectionMessages((current) => ({
        ...current,
        [sectionId]: "Saved",
      }));
    } catch {
      setSectionMessages((current) => ({
        ...current,
        [sectionId]: "Unable to save",
      }));
    } finally {
      setSavingSectionId(null);
    }
  }

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return members;
    }

    return members.filter((member) => {
      return [member.full_name, member.email, member.phone, member.ministry, member.department]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [members, searchTerm]);

  const totalMembers = members.length;
  const activeMembers = members.filter((member) => member.is_active).length;
  const inactiveMembers = totalMembers - activeMembers;

  async function handleCreateMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSavingMember(true);

    try {
      if (editingMemberId) {
        await apiRequest<Member>(`/members/${editingMemberId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            ...formState,
          }),
        });
        setFormSuccess("Member profile updated successfully.");
      } else {
        await apiRequest<Member>("/members/", {
          method: "POST",
          body: JSON.stringify({
            ...formState,
            is_active: true,
          }),
        });
        setFormSuccess("Member profile created successfully.");
      }

      setFormState(initialFormState);
      setEditingMemberId(null);
      await loadMembers();
    } catch (error: unknown) {
      const fallback = "Unable to create member profile. Please review the form and try again.";
      if (error && typeof error === "object") {
        const errorMap = error as Record<string, unknown>;

        const detail = errorMap.detail;
        if (typeof detail === "string" && detail.trim()) {
          setFormError(detail);
          return;
        }
        if (Array.isArray(detail) && detail[0] && typeof detail[0] === "string") {
          setFormError(detail[0]);
          return;
        }

        const firstKey = Object.keys(errorMap)[0];
        const firstValue = firstKey ? errorMap[firstKey] : null;
        if (Array.isArray(firstValue) && firstValue[0] && typeof firstValue[0] === "string") {
          setFormError(firstValue[0]);
        } else {
          setFormError(fallback);
        }
      } else {
        setFormError(fallback);
      }
    } finally {
      setIsSavingMember(false);
    }
  }

  async function handleQuickAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = quickAddName.trim();
    if (!normalizedName) {
      setFormError("Member name is required.");
      setFormSuccess(null);
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsQuickAdding(true);

    try {
      await apiRequest<Member>("/members/", {
        method: "POST",
        body: JSON.stringify({
          full_name: normalizedName,
          is_active: true,
        }),
      });

      setQuickAddName("");
      setFormSuccess("Member added successfully.");
      await loadMembers();
    } catch {
      setFormError("Unable to add member. Please try again.");
    } finally {
      setIsQuickAdding(false);
    }
  }

  function handleStartEditMember(member: Member) {
    setEditingMemberId(member.id);
    setFormState({
      full_name: member.full_name || "",
      phone: member.phone || "",
      ministry: member.ministry || "",
      department: member.department || "",
      email: member.email || "",
      gender: member.gender || "",
      address: member.address || "",
    });
    setFormError(null);
    setFormSuccess(null);
    document.getElementById("profiles")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCancelEditMember() {
    setEditingMemberId(null);
    setFormState(initialFormState);
    setFormError(null);
  }

  return (
    <DashboardContentShell title="Member Management" subtitle="Manage profiles, households, and member records">
      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-purple-950">Member Operations</h2>
            <p className="mt-1 text-sm font-medium text-purple-700">
              Structured modules for member lifecycle, records, and ministry engagement.
            </p>
          </div>
          <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            6 Sections
          </span>
        </div>

        <form className="mt-4 flex flex-col gap-2 md:flex-row" onSubmit={handleQuickAddMember}>
          <input
            value={quickAddName}
            onChange={(event) => setQuickAddName(event.target.value)}
            required
            className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
            placeholder="Quick Add Member (Full name only)"
          />
          <button
            type="submit"
            disabled={isQuickAdding}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isQuickAdding ? <Loader2 size={16} className="animate-spin" /> : null}
            {isQuickAdding ? "Adding..." : "Add Member"}
          </button>
        </form>

        <div className="mt-4 border-t border-purple-200 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-purple-700">Membership Lifecycle</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {membershipLifecycleFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {step}
                </span>
                {index < membershipLifecycleFlow.length - 1 ? <span className="text-purple-400">→</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">Total Members</p>
            <Users2 size={16} className="text-purple-700" />
          </div>
          <p className="mt-3 text-3xl font-semibold leading-none text-purple-950">{totalMembers.toLocaleString()}</p>
        </article>

        <article className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">Active</p>
            <CircleUserRound size={16} className="text-purple-700" />
          </div>
          <p className="mt-3 text-3xl font-semibold leading-none text-purple-950">{activeMembers.toLocaleString()}</p>
        </article>

        <article className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">Inactive</p>
            <CircleOff size={16} className="text-purple-700" />
          </div>
          <p className="mt-3 text-3xl font-semibold leading-none text-purple-950">{inactiveMembers.toLocaleString()}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {editableMemberSections.map((section) => {
          const SectionIcon = section.icon;

          return (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-purple-300 bg-purple-800 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-purple-300/40 bg-purple-700 text-purple-100">
                  <SectionIcon size={16} strokeWidth={2.2} />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-white">{section.title}</h3>
              </div>

              <textarea
                value={sectionInputs[section.id] ?? ""}
                onChange={(event) =>
                  setSectionInputs((current) => ({
                    ...current,
                    [section.id]: event.target.value,
                  }))
                }
                rows={4}
                placeholder={section.placeholder}
                disabled={isLoadingSectionInputs}
                className="w-full resize-y rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 placeholder:text-purple-400 focus:ring"
              />

              <div className="mt-3 flex items-center justify-end gap-3">
                {sectionMessages[section.id] ? (
                  <p className="text-xs font-semibold text-purple-100">{sectionMessages[section.id]}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleSaveSectionInput(section.id)}
                  disabled={isLoadingSectionInputs || savingSectionId === section.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingSectionId === section.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  {savingSectionId === section.id ? "Saving..." : "Save"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section id="profiles" className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-purple-300 bg-purple-50 text-purple-700">
            <Users size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">Member profiles</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">
              {editingMemberId ? "Edit profile" : "Create profile"}
            </p>
          </div>
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateMember}>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Full name</span>
            <input
              value={formState.full_name}
              onChange={(event) => setFormState((current) => ({ ...current, full_name: event.target.value }))}
              required
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
              placeholder="Enter full name"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Phone (optional)</span>
            <input
              value={formState.phone}
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
              placeholder="Enter phone number"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
              Ministry (optional)
            </span>
            <input
              value={formState.ministry}
              onChange={(event) => setFormState((current) => ({ ...current, ministry: event.target.value }))}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
              placeholder="e.g. Worship"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
              Department (optional)
            </span>
            <select
              value={formState.department}
              onChange={(event) => setFormState((current) => ({ ...current, department: event.target.value }))}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
            >
              <option value="">Select department</option>
              {isLoadingDepartments ? <option value="" disabled>Loading departments...</option> : null}
              {!isLoadingDepartments && departmentOptions.length === 0 ? (
                <option value="" disabled>No departments available</option>
              ) : null}
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
            {!isLoadingDepartments && departmentOptions.length === 0 ? (
              <p className="text-xs font-medium text-purple-600">
                Add departments first in <Link href="/departments" className="font-semibold text-purple-700 hover:text-purple-900">Departments</Link> to assign members automatically.
              </p>
            ) : null}
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
              placeholder="name@example.com"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Gender</span>
            <select
              value={formState.gender}
              onChange={(event) => setFormState((current) => ({ ...current, gender: event.target.value }))}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Address</span>
            <textarea
              value={formState.address}
              onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
              placeholder="Enter address"
            />
          </label>

          <div className="md:col-span-2">
            {formError ? <p className="mb-2 text-sm font-medium text-rose-600">{formError}</p> : null}
            {formSuccess ? <p className="mb-2 text-sm font-medium text-emerald-700">{formSuccess}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isSavingMember}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingMember ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSavingMember ? "Saving..." : editingMemberId ? "Update member profile" : "Create member profile"}
              </button>

              {editingMemberId ? (
                <button
                  type="button"
                  onClick={handleCancelEditMember}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </section>

      <section id="directory" className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-purple-300 bg-purple-50 text-purple-700">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-purple-950">Member directory</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-purple-600">Live records</p>
            </div>
          </div>

          <label className="relative w-full max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search members"
              className="w-full rounded-xl border border-purple-300 bg-white py-2 pl-9 pr-3 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
            />
          </label>
        </div>

        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-purple-200">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Ministry</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 bg-white text-sm text-purple-900">
              {isLoadingMembers ? (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-sm font-medium text-purple-600">
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-sm font-medium text-purple-600">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-purple-50/60">
                    <td className="px-3 py-2.5 font-medium text-purple-950">{member.full_name}</td>
                    <td className="px-3 py-2.5">
                      <p>{member.phone || "No phone"}</p>
                      <p className="text-xs text-purple-600">{member.email || "No email"}</p>
                    </td>
                    <td className="px-3 py-2.5">{member.ministry || "—"}</td>
                    <td className="px-3 py-2.5">{member.department || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          member.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartEditMember(member)}
                          className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardContentShell>
  );
}
