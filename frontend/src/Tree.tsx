import { Telescope } from "lucide-react";
import type { TreeType } from "mdfocus-common/src/common";
import { NavLink } from "react-router";
import { Discord } from "./Discord";
import { FullScreen } from "./FullScreen";
import { GitHub } from "./GitHub";
import { Status } from "./Status";
import { Theme } from "./Theme";

type DirNode = {
  kind: "dir";
  name: string;
  children: Map<string, Node>;
  zindex: number;
};

type FileNode = {
  kind: "file";
  name: string;
  path: string;
};

type Node = DirNode | FileNode;

function buildTree(paths: string[]): DirNode {
  let zindex = paths.length + 1;
  const root: DirNode = { kind: "dir", name: "", children: new Map(), zindex };

  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    let current: DirNode = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLeaf = i === parts.length - 1;

      if (isLeaf) {
        current.children.set(part, { kind: "file", name: part, path });
        continue;
      }

      const existing = current.children.get(part);
      if (existing?.kind === "dir") {
        current = existing;
      } else {
        const next: DirNode = {
          kind: "dir",
          name: part,
          children: new Map(),
          zindex: --zindex,
        };
        current.children.set(part, next);
        current = next;
      }
    }
  }

  return root;
}

function sortChildren(children: Map<string, Node>): Node[] {
  return [...children.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "file" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function TreeNodeView({
  node,
  depth,
  prefix,
  root,
}: {
  node: Node;
  depth: number;
  prefix: string;
  root: string;
}) {
  if (node.kind === "file") {
    return (
      <div
        style={{ paddingLeft: depth * 12 }}
        className="flex items-center gap-2"
      >
        <NavLink
          to={node.path}
          className={() => "block truncate rounded py-1"}
          title={node.path}
        >
          {node.name}
        </NavLink>
        <Status root={root} path={node.path} />
      </div>
    );
  }

  return (
    <div className="select-none">
      <div
        className="sticky bg-(--mdfocus-bg)"
        style={{
          paddingLeft: depth * 12,
          top: (depth + 1) * 28,
          zIndex: node.zindex,
        }}
      >
        <div className="rounded py-1 text-(--mdfocus-muted) font-bold">
          {node.name ? `${node.name}/` : ""}
        </div>
      </div>
      {sortChildren(node.children).map((child) => (
        <TreeNodeView
          key={
            child.kind === "file"
              ? child.path
              : `${prefix}/${node.name}/${child.name}`
          }
          node={child}
          depth={depth + 1}
          prefix={`${prefix}/${node.name}`}
          root={root}
        />
      ))}
    </div>
  );
}

export function Tree({ tree }: { tree: TreeType }) {
  const root = buildTree(tree.paths);
  return (
    <div className="text-sm">
      <div
        className="top-0 sticky bg-(--mdfocus-bg) flex items-center h-7 gap-2"
        style={{ zIndex: root.zindex }}
      >
        <Telescope size={16} />
        <span className="font-bold">mdfocus</span>
        <div className="w-4"></div>
        <span className="flex-1 truncate">{tree.root}/</span>
        <Discord />
        <GitHub />
        <Theme />
        <FullScreen />
      </div>
      {sortChildren(root.children).map((child) => (
        <TreeNodeView
          key={child.kind === "file" ? child.path : `/${child.name}`}
          node={child}
          depth={0}
          prefix=""
          root={tree.root}
        />
      ))}
    </div>
  );
}
