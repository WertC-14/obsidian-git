<script lang="ts">
    import { setIcon } from "obsidian";
    import { COMMIT_GRAPH_PAGE_SIZE } from "src/constants";
    import type ObsidianGit from "src/main";
    import type { LogEntry, Status } from "src/types";
    import { getDisplayPath } from "src/utils";
    import { onMount } from "svelte";
    import { assignLanes } from "./graph/laneAssignment";
    import GraphRowComponent from "./components/graphRow.svelte";
    import type HistoryView from "./historyView";

    interface Props {
        plugin: ObsidianGit;
        view: HistoryView;
    }

    let { plugin = $bindable(), view }: Props = $props();
    let loading: boolean = $state(false);
    let buttons: HTMLElement[] = $state([]);
    let logs: LogEntry[] | undefined = $state();
    let showTree: boolean = $state(plugin.settings.treeStructure);
    let status: Status | undefined = $state(plugin.cachedStatus);
    let uncommittedOpen = $state(false);
    let page = $state(0);
    let hasMore = $state(true);

    const LANE_WIDTH = 16;

    let nodes = $derived(assignLanes(logs ?? []));
    let laneCount = $derived(
        Math.max(
            0,
            ...nodes.flatMap((n) => [
                n.lane,
                ...n.passThroughLanes.map((p) => p.lane),
                ...n.parentLanes.map((p) => p.lane),
                ...n.convergingLanes.map((c) => c.lane),
            ])
        ) + 1
    );
    let hasUncommittedChanges = $derived(
        (status?.staged.length ?? 0) + (status?.changed.length ?? 0) > 0
    );

    onMount(() => {
        view.registerEvent(
            view.app.workspace.on(
                "obsidian-git:head-change",
                () => void refresh().catch(console.error)
            )
        );
        view.registerEvent(
            view.app.workspace.on(
                "obsidian-git:status-changed",
                () => (status = plugin.cachedStatus)
            )
        );
    });

    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });

    refresh().catch(console.error);

    function triggerRefresh() {
        refresh().catch(console.error);
    }

    async function refresh() {
        if (!plugin.gitReady) {
            logs = undefined;
            hasMore = true;
            return;
        }
        loading = true;
        status = plugin.cachedStatus;
        page = 0;
        logs = await plugin.gitManager.logGraph(COMMIT_GRAPH_PAGE_SIZE, 0);
        hasMore = logs.length === COMMIT_GRAPH_PAGE_SIZE;
        loading = false;
    }

    async function loadMore() {
        if (!plugin.gitReady || logs === undefined || loading) {
            return;
        }
        loading = true;
        const nextPage = page + 1;
        const newLogs = await plugin.gitManager.logGraph(
            COMMIT_GRAPH_PAGE_SIZE,
            nextPage * COMMIT_GRAPH_PAGE_SIZE
        );
        logs.push(...newLogs);
        page = nextPage;
        hasMore = newLogs.length === COMMIT_GRAPH_PAGE_SIZE;
        loading = false;
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<main class="git-view">
    <div class="nav-header">
        <div class="nav-buttons-container">
            <div
                id="layoutChange"
                class="clickable-icon nav-action-button"
                data-icon={showTree ? "list" : "folder"}
                aria-label="Change Layout"
                bind:this={buttons[0]}
                onclick={() => {
                    showTree = !showTree;
                    setIcon(buttons[0], showTree ? "list" : "folder");
                    plugin.settings.treeStructure = showTree;
                    void plugin.saveSettings();
                }}
            ></div>
            <div
                id="refresh"
                class="clickable-icon nav-action-button"
                class:loading
                data-icon="refresh-cw"
                aria-label="Refresh"
                bind:this={buttons[1]}
                onclick={triggerRefresh}
            ></div>
        </div>
    </div>

    <div class="nav-files-container" style="position: relative;">
        {#if logs}
            <div class="tree-item nav-folder mod-root">
                {#if hasUncommittedChanges && status}
                    <div
                        class="tree-item uncommitted-row"
                        class:is-collapsed={!uncommittedOpen}
                    >
                        <div
                            class="tree-item-self is-clickable nav-folder-title uncommitted-header"
                            onclick={() => (uncommittedOpen = !uncommittedOpen)}
                        >
                            <div
                                class="graph-lanes"
                                style="width: {laneCount * LANE_WIDTH}px"
                            >
                                <div class="graph-dot-uncommitted"></div>
                            </div>
                            <div
                                class="tree-item-inner nav-folder-title-content"
                            >
                                Uncommitted changes
                            </div>
                            <span class="tree-item-flair"
                                >{status.staged.length +
                                    status.changed.length}</span
                            >
                        </div>
                        {#if uncommittedOpen}
                            <div class="tree-item-children">
                                {#if status.staged.length > 0}
                                    <div class="uncommitted-group-title">
                                        Staged
                                    </div>
                                    {#each status.staged as file (file.vaultPath)}
                                        <div class="uncommitted-file">
                                            {getDisplayPath(file.vaultPath)}
                                        </div>
                                    {/each}
                                {/if}
                                {#if status.changed.length > 0}
                                    <div class="uncommitted-group-title">
                                        Changes
                                    </div>
                                    {#each status.changed as file (file.vaultPath)}
                                        <div class="uncommitted-file">
                                            {getDisplayPath(file.vaultPath)}
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
                {#each logs as log, i (log.hash)}
                    <GraphRowComponent
                        {log}
                        node={nodes[i]}
                        {laneCount}
                        {showTree}
                        {plugin}
                        {view}
                    />
                {/each}
            </div>
        {/if}
        {#if hasMore}
            <div class="git-load-more">
                <button disabled={loading} onclick={loadMore}>
                    {loading ? "Loading..." : "Load more"}
                </button>
            </div>
        {/if}
        <!-- Ensure the load-more button is reachable above the overlaying status bar -->
        <div style="margin-bottom:40px"></div>
    </div>
</main>

<style lang="scss">
    .graph-lanes {
        position: relative;
        flex: 0 0 auto;
        align-self: stretch;
    }

    .graph-dot-uncommitted {
        position: absolute;
        left: 8px;
        top: 16px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 2px dashed var(--text-muted);
        transform: translate(-4px, -4px);
    }

    .uncommitted-header {
        align-items: center;
    }

    .uncommitted-group-title {
        padding: var(--size-2-1) var(--size-4-2);
        color: var(--text-muted);
        font-size: var(--font-ui-smaller);
        font-weight: var(--font-medium);
    }

    .uncommitted-file {
        padding: var(--size-2-1) var(--size-4-3);
        color: var(--text-muted);
        font-size: var(--font-ui-small);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .git-load-more {
        display: flex;
        justify-content: center;
        padding: var(--size-4-2);
    }
</style>
