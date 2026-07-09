import type { App, WorkspaceLeaf } from "obsidian";
import type ObsidianGit from "src/main";

/**
 * Minimal shape the commit log/graph row components need from their host
 * view. Both the History view and the Source Control view (which embeds the
 * graph too) satisfy this structurally, so log rows can be rendered from
 * either without coupling them to one specific `ItemView` subclass.
 */
export interface LogHostView {
    app: App;
    leaf: WorkspaceLeaf;
    plugin: ObsidianGit;
}
