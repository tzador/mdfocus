import type { TreeType } from "mdream-common/src/common";
import { NavLink } from "react-router";

type DirNode = {
  kind: "dir";
  name: string;
  children: Map<string, Node>;
};

type FileNode = {
  kind: "file";
  name: string;
  path: string;
};

type Node = DirNode | FileNode;

function buildTree(paths: string[]): DirNode {
  const root: DirNode = { kind: "dir", name: "", children: new Map() };

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
        const next: DirNode = { kind: "dir", name: part, children: new Map() };
        current.children.set(part, next);
        current = next;
      }
    }
  }

  return root;
}

function sortChildren(children: Map<string, Node>): Node[] {
  return [...children.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "file" ? -1 : 1; // files first
    return a.name.localeCompare(b.name);
  });
}

function TreeNodeView({
  node,
  depth,
  prefix,
}: {
  node: Node;
  depth: number;
  prefix: string;
}) {
  if (node.kind === "file") {
    return (
      <div style={{ paddingLeft: depth * 12 }} id={`mdream-page-${node.path}`}>
        <NavLink
          to={node.path}
          className={() =>
            "block truncate rounded px-2 py-1 text-blue-500 hover:bg-(--mdream-card)"
          }
          title={node.path}
        >
          {node.name}
        </NavLink>
      </div>
    );
  }

  // Dir (non-clickable)
  return (
    <div className="select-none">
      <div style={{ paddingLeft: depth * 12 }}>
        <div className="rounded px-2 py-1 text-(--mdream-muted) font-bold">
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
        />
      ))}
    </div>
  );
}

export function Tree({ tree }: { tree: TreeType }) {
  const root = buildTree(tree.paths);
  return (
    <div className="text-sm font-mono">
      <div className="mb-8">{tree.root}/</div>
      {sortChildren(root.children).map((child) => (
        <TreeNodeView
          key={child.kind === "file" ? child.path : `/${child.name}`}
          node={child}
          depth={1}
          prefix=""
        />
      ))}
    </div>
  );
}
