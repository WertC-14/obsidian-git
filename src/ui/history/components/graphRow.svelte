<script lang="ts">
    import type ObsidianGit from "src/main";
    import type { LogEntry } from "src/types";
    import type { GraphNode } from "../graph/laneAssignment";
    import type { LogHostView } from "../logHostView";
    import LogComponent from "./logComponent.svelte";

    interface Props {
        log: LogEntry;
        node: GraphNode;
        laneCount: number;
        view: LogHostView;
        showTree: boolean;
        plugin: ObsidianGit;
    }

    let { log, node, laneCount, view, showTree, plugin }: Props = $props();

    // The rail is one plain SVG with a 1:1 viewBox (no CSS stretching/
    // `preserveAspectRatio` tricks) so the lines are always geometrically
    // exact - stretching an <svg> via top/bottom CSS anchors is unreliable
    // because it's a replaced element, which is what caused the earlier
    // crooked/looping lines. The dot always sits at the vertical center of
    // the fixed-height header row; the rail's total height tracks the
    // content's actual rendered height (via `bind:clientHeight` below) so
    // it keeps reaching the next row even when this row is expanded to
    // show its changed files.
    const LANE_WIDTH = 16;
    const HEADER_HEIGHT = 32;
    const DOT_Y = HEADER_HEIGHT / 2;

    let contentHeight = $state(HEADER_HEIGHT);
    let railHeight = $derived(Math.max(contentHeight, HEADER_HEIGHT));

    function laneX(lane: number): number {
        return lane * LANE_WIDTH + LANE_WIDTH / 2;
    }

    let isHead = $derived(log.refs.some((ref) => ref.type === "head"));
    let localBranchRefs = $derived(
        log.refs.filter((ref) => ref.type === "local-branch")
    );
    let tagRefs = $derived(log.refs.filter((ref) => ref.type === "tag"));
    let straightDownParent = $derived(
        node.parentLanes.find((p) => p.lane === node.lane)
    );
    let divertingParents = $derived(
        node.parentLanes.filter((p) => p.lane !== node.lane)
    );
    let railWidth = $derived(laneCount * LANE_WIDTH);
    let dotRadius = $derived(node.isMergeCommit || isHead ? 5 : 4);
</script>

<div class="graph-row">
    <svg
        class="graph-rail"
        width={railWidth}
        height={railHeight}
        viewBox="0 0 {railWidth} {railHeight}"
    >
        {#each node.passThroughLanes as pass (pass.lane)}
            <line
                x1={laneX(pass.lane)}
                y1="0"
                x2={laneX(pass.lane)}
                y2={railHeight}
                stroke={pass.color}
                stroke-width="2"
            />
        {/each}

        {#if !node.isNewBranchTip}
            <line
                x1={laneX(node.lane)}
                y1="0"
                x2={laneX(node.lane)}
                y2={DOT_Y}
                stroke={node.color}
                stroke-width="2"
            />
        {/if}

        {#each node.convergingLanes as conv (conv.lane)}
            <line
                x1={laneX(conv.lane)}
                y1="0"
                x2={laneX(node.lane)}
                y2={DOT_Y}
                stroke={conv.color}
                stroke-width="2"
            />
        {/each}

        {#if straightDownParent}
            <line
                x1={laneX(node.lane)}
                y1={DOT_Y}
                x2={laneX(node.lane)}
                y2={railHeight}
                stroke={node.color}
                stroke-width="2"
            />
        {/if}

        {#each divertingParents as parent (parent.hash)}
            <line
                x1={laneX(node.lane)}
                y1={DOT_Y}
                x2={laneX(parent.lane)}
                y2={railHeight}
                stroke={parent.color}
                stroke-width="2"
            />
        {/each}

        {#if isHead}
            <circle
                cx={laneX(node.lane)}
                cy={DOT_Y}
                r={dotRadius}
                fill="var(--background-primary)"
                stroke={node.color}
                stroke-width="2"
            />
        {:else}
            <circle
                cx={laneX(node.lane)}
                cy={DOT_Y}
                r={dotRadius}
                fill={node.color}
            />
        {/if}
    </svg>

    {#if localBranchRefs.length > 0 || tagRefs.length > 0}
        <div class="graph-branch-badges">
            {#each localBranchRefs as ref (ref.name)}
                <span
                    class="graph-branch-badge"
                    style="background-color: {node.color}"
                >
                    {ref.name}
                </span>
            {/each}
            {#each tagRefs as ref (ref.name)}
                <span class="graph-tag-badge">{ref.name}</span>
            {/each}
        </div>
    {/if}

    <div class="graph-row-content" bind:clientHeight={contentHeight}>
        <LogComponent {log} {view} {showTree} {plugin} />
    </div>
</div>

<style lang="scss">
    .graph-row {
        display: flex;
        align-items: flex-start;
    }

    .graph-rail {
        flex: 0 0 auto;
        display: block;
    }

    .graph-branch-badges {
        display: flex;
        align-items: center;
        gap: var(--size-2-1);
        padding: 0 var(--size-2-2);
        height: 32px;
        flex: 0 0 auto;
    }

    .graph-branch-badge {
        padding: 0 var(--size-2-2);
        border-radius: var(--radius-s);
        color: #fff;
        font-size: var(--font-ui-smaller);
        white-space: nowrap;
    }

    .graph-tag-badge {
        padding: 0 var(--size-2-2);
        border-radius: var(--radius-s);
        border: 1px solid var(--text-accent);
        color: var(--text-accent);
        font-size: var(--font-ui-smaller);
        white-space: nowrap;
    }

    .graph-row-content {
        flex: 1 1 auto;
        min-width: 0;
    }
</style>
