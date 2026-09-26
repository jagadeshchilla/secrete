"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { RoadmapEntry } from "@/types/roadmap";
import { ExternalLinkIcon } from "@/components/icons";

const handleStyle: React.CSSProperties = { opacity: 0 };

interface StageNodeData {
  label: string;
  emphasis?: boolean;
  subtitle?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

interface ItemNodeData {
  label: string;
  side: "left" | "right";
  [key: string]: unknown;
}

// The spine node — role intro, and each stage header sitting on the central line.
// Clickable (with a "from X" subtitle) when this stage's skills are borrowed
// from another role's own roadmap.
function StageNode({ data }: NodeProps & { data: StageNodeData }) {
  const Tag = data.onClick ? "button" : "div";
  return (
    <Tag
      onClick={data.onClick}
      className="border-2 px-5 py-3 text-center shadow-sm"
      style={{
        borderColor: "var(--accent)",
        background: data.emphasis ? "var(--accent)" : "var(--accent-soft)",
        color: data.emphasis ? "white" : "var(--accent)",
        borderRadius: "var(--radius)",
        minWidth: 190,
        cursor: data.onClick ? "pointer" : "default",
      }}
    >
      <Handle type="target" id="top" position={Position.Top} style={handleStyle} />
      <Handle type="source" id="bottom" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" id="left" position={Position.Left} style={handleStyle} />
      <Handle type="source" id="right" position={Position.Right} style={handleStyle} />
      <div style={{ fontWeight: 600, fontSize: 13 }}>{data.label}</div>
      {data.subtitle && (
        <div
          className="mt-0.5 flex items-center justify-center gap-1"
          style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}
        >
          {data.subtitle}
          {data.onClick && <ExternalLinkIcon className="h-2.5 w-2.5" />}
        </div>
      )}
    </Tag>
  );
}

// A single tool/skill chip branching off a stage — links out to the Courses
// page so the tool named here has somewhere to actually go learn it.
function ItemNode({ data }: NodeProps & { data: ItemNodeData }) {
  return (
    <Link
      href={`/courses?tool=${encodeURIComponent(data.label)}`}
      className="block cursor-pointer border px-3.5 py-2 text-center shadow-sm transition-colors hover:border-[var(--accent)]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--text)",
        borderRadius: "var(--radius)",
        minWidth: 150,
        fontSize: 12,
      }}
    >
      <Handle
        type="target"
        id={data.side === "left" ? "right" : "left"}
        position={data.side === "left" ? Position.Right : Position.Left}
        style={handleStyle}
      />
      {data.label}
    </Link>
  );
}

const nodeTypes = {
  stage: StageNode,
  item: ItemNode,
};

const STAGE_GAP = 230; // vertical distance between spine stages
const ITEM_GAP = 66; // vertical distance between stacked items in a branch
const BRANCH_X = 260; // horizontal offset of a branch cluster from the spine

export default function RoadmapChart({
  roleName,
  entry,
  resolveLabel,
  onOpenRelated,
}: {
  roleName: string;
  entry: RoadmapEntry;
  resolveLabel: (key: string) => { label: string; hasData: boolean } | null;
  onOpenRelated: (key: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const n: Node[] = [];
    const e: Edge[] = [];

    // Intro node — top of the spine
    n.push({
      id: "intro",
      type: "stage",
      position: { x: -95, y: 0 },
      data: { label: roleName, emphasis: true },
      draggable: false,
    });

    let prevSpineId = "intro";
    let cursorY = STAGE_GAP;

    entry.skills.forEach((s, i) => {
      const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
      const sourceInfo = s.sourceRoleKey ? resolveLabel(s.sourceRoleKey) : null;
      const stageId = `stage-skill-${i}`;

      n.push({
        id: stageId,
        type: "stage",
        position: { x: -95, y: cursorY },
        data: {
          label: s.category,
          subtitle: sourceInfo ? `from ${sourceInfo.label}` : undefined,
          onClick: sourceInfo?.hasData ? () => onOpenRelated(s.sourceRoleKey!) : undefined,
        },
        draggable: false,
      });
      e.push({
        id: `spine-${prevSpineId}-${stageId}`,
        source: prevSpineId,
        sourceHandle: "bottom",
        target: stageId,
        targetHandle: "top",
        style: { stroke: "var(--accent)", strokeWidth: 2 },
      });

      const branchX = side === "left" ? -BRANCH_X - 95 : BRANCH_X + 5;
      const startY = cursorY - ((s.items.length - 1) * ITEM_GAP) / 2;

      s.items.forEach((label, j) => {
        const itemId = `skill-${i}-${j}`;
        n.push({
          id: itemId,
          type: "item",
          position: { x: branchX, y: startY + j * ITEM_GAP },
          data: { label, side },
          draggable: false,
        });
        e.push({
          id: `branch-${stageId}-${itemId}`,
          source: stageId,
          sourceHandle: side,
          target: itemId,
          targetHandle: side === "left" ? "right" : "left",
          style: { stroke: "var(--border)", strokeWidth: 1.5, strokeDasharray: "4 3" },
        });
      });

      prevSpineId = stageId;
      cursorY += STAGE_GAP;
    });

    return { nodes: n, edges: e };
  }, [entry, roleName, resolveLabel, onOpenRelated]);

  return (
    <div
      className="h-[640px] w-full overflow-hidden border"
      style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
