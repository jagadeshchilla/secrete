"use client";

import { useMemo, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useResources } from "@/context/ResourcesContext";
import type { ResourceType } from "@/types/resources";
import { PlayIcon, TrashIcon, PlusIcon, ExternalLinkIcon } from "@/components/icons";

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "article", label: "Article" },
  { value: "course", label: "Course" },
  { value: "docs", label: "Docs" },
  { value: "other", label: "Other" },
];

export default function AdminPage() {
  const { data, domains } = useAppState();
  const { getResources, addResource, removeResource } = useResources();

  const [domain, setDomain] = useState(domains[0] || "");
  const rolesInDomain = useMemo(() => data.filter((r) => r.domain === domain), [data, domain]);
  const [roleKey, setRoleKey] = useState(rolesInDomain[0] ? keyFor(rolesInDomain[0]) : "");

  const selectedRole = data.find((r) => keyFor(r) === roleKey);
  const resources = selectedRole ? getResources(keyFor(selectedRole)) : [];

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>("youtube");

  function handleDomainChange(d: string) {
    setDomain(d);
    const first = data.find((r) => r.domain === d);
    setRoleKey(first ? keyFor(first) : "");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole || !title.trim() || !url.trim()) return;
    addResource(keyFor(selectedRole), { title: title.trim(), url: url.trim(), type });
    setTitle("");
    setUrl("");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f3ede1]">Learning resources</h1>
      <p className="mt-1 text-sm text-[#9a927e]">
        Attach YouTube videos, articles, courses, or docs to any role. These show up under that
        role&apos;s detail panel in the main app for both of you.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#9a927e]">Domain</label>
          <select
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full border border-[#2a2418] bg-[#1a1710] px-3 py-2 text-sm text-[#f3ede1]"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {stripEmoji(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#9a927e]">Role</label>
          <select
            value={roleKey}
            onChange={(e) => setRoleKey(e.target.value)}
            className="w-full border border-[#2a2418] bg-[#1a1710] px-3 py-2 text-sm text-[#f3ede1]"
          >
            {rolesInDomain.map((r) => (
              <option key={keyFor(r)} value={keyFor(r)}>
                {r.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRole && (
        <>
          <form
            onSubmit={handleAdd}
            className="mt-6 grid grid-cols-1 gap-2 border border-[#2a2418] bg-[#1a1710] p-4 sm:grid-cols-[1fr_1fr_140px_auto]"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border border-[#2a2418] bg-[#12100a] px-3 py-2 text-sm text-[#f3ede1] outline-none focus:border-[#f2c368]"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="border border-[#2a2418] bg-[#12100a] px-3 py-2 text-sm text-[#f3ede1] outline-none focus:border-[#f2c368]"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="border border-[#2a2418] bg-[#12100a] px-3 py-2 text-sm text-[#f3ede1]"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 bg-[#f2c368] px-4 py-2 text-sm font-medium text-[#12100a]"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {resources.length === 0 ? (
              <p className="border border-dashed border-[#2a2418] p-6 text-center text-sm text-[#9a927e]">
                No resources added yet for <strong className="text-[#c9c0ac]">{selectedRole.role}</strong>.
              </p>
            ) : (
              resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 border border-[#2a2418] bg-[#1a1710] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <PlayIcon className="h-4 w-4 shrink-0 text-[#f2c368]" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[#f3ede1]">{r.title}</div>
                      <div className="truncate text-xs text-[#9a927e]">{r.url}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#9a927e] hover:text-[#f2c368]"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => removeResource(keyFor(selectedRole), r.id)}
                      className="p-1.5 text-[#9a927e] hover:text-[#e07a5f]"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
