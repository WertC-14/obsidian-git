import type { LogEntry } from "src/types";

/**
 * Fixed, theme-independent palette for commit-graph lanes. Colors are
 * reused round-robin as lanes open and close, so the palette size is the
 * number of simultaneously visible lanes before a color repeats - it is
 * intentionally not tied to Obsidian's accent colors since the number of
 * lanes is unbounded.
 */
export const LANE_COLOR_PALETTE: readonly string[] = [
    "#4C72B0", // blue
    "#DD8452", // orange
    "#55A868", // green
    "#C44E52", // red
    "#8172B2", // purple
    "#937860", // brown
    "#DA8BC3", // pink
    "#8C8C8C", // gray
    "#CCB974", // olive
    "#64B5CD", // cyan
];

export interface GraphNode {
    hash: string;
    lane: number;
    color: string;
    /** Which lane each parent continues in, and that lane's color (used to draw lines downward). */
    parentLanes: { hash: string; lane: number; color: string }[];
    /**
     * Lanes other than this commit's own that were also waiting for this
     * exact commit (two branches converging on a shared ancestor). These
     * lanes close here; the UI draws them merging into this commit's dot,
     * each in the color it held right before closing.
     */
    convergingLanes: { lane: number; color: string }[];
    /**
     * Lanes that are open both before and after this commit but are
     * unrelated to it - drawn as plain vertical lines passing through the
     * row without touching this commit's dot.
     */
    passThroughLanes: { lane: number; color: string }[];
    isMergeCommit: boolean;
    /**
     * True if this commit opened a brand-new lane (a branch tip not
     * continuing any prior lane) - the UI draws no incoming line from the
     * row above for it.
     */
    isNewBranchTip: boolean;
}

/**
 * Assigns each commit to a vertical lane and a stable color, in the style of
 * `git log --graph`. Pure function of the input array: given the same
 * (parent-annotated, newest-first) commit list it always produces the same
 * output, which keeps it easy to unit test and safe to recompute from
 * scratch whenever more commits are paged in.
 *
 * Algorithm: keep a list of "open" lanes, each awaiting a specific commit
 * hash (the next commit that continues it). For every commit, in order:
 *  1. Find lane(s) awaiting this commit's hash. Take the first as this
 *     commit's own lane; any others converge into it and close.
 *  2. If no lane awaited it, it's a new branch tip: open a fresh lane.
 *  3. The first parent continues in the same lane. Any additional parents
 *     (merge parents) reuse an existing lane already awaiting them, or open
 *     a new one.
 *  4. A commit with no parents (a root commit) closes its lane.
 * Closed lanes return their color to the pool for the next lane opened.
 */
export function assignLanes(commits: readonly LogEntry[]): GraphNode[] {
    // lane index -> hash this lane is waiting to see next, or undefined if free
    const laneAwaits: (string | undefined)[] = [];
    const laneColor: (number | undefined)[] = [];
    const usedColors = new Set<number>();
    let colorCursor = 0;

    function colorOf(lane: number): string {
        return LANE_COLOR_PALETTE[laneColor[lane]!];
    }

    function takeColor(): number {
        for (let i = 0; i < LANE_COLOR_PALETTE.length; i++) {
            if (!usedColors.has(i)) {
                usedColors.add(i);
                return i;
            }
        }
        // All colors momentarily in use (more concurrent lanes than palette
        // entries): fall back to round-robin reuse rather than growing the
        // palette.
        const color = colorCursor % LANE_COLOR_PALETTE.length;
        colorCursor++;
        return color;
    }

    function releaseColor(color: number | undefined) {
        if (color !== undefined) {
            usedColors.delete(color);
        }
    }

    function openLane(awaitingHash: string): number {
        const freeIndex = laneAwaits.indexOf(undefined);
        const lane = freeIndex >= 0 ? freeIndex : laneAwaits.length;
        laneAwaits[lane] = awaitingHash;
        laneColor[lane] = takeColor();
        return lane;
    }

    function closeLane(lane: number) {
        releaseColor(laneColor[lane]);
        laneAwaits[lane] = undefined;
        laneColor[lane] = undefined;
    }

    function findAllWaiting(hash: string): number[] {
        const lanes: number[] = [];
        laneAwaits.forEach((awaited, i) => {
            if (awaited === hash) lanes.push(i);
        });
        return lanes;
    }

    const nodes: GraphNode[] = [];

    for (const commit of commits) {
        const openLanesBefore: number[] = [];
        laneAwaits.forEach((awaited, i) => {
            if (awaited !== undefined) openLanesBefore.push(i);
        });

        const waitingLanes = findAllWaiting(commit.hash);
        const isNewBranchTip = waitingLanes.length === 0;
        let lane: number;
        let convergingLaneIndices: number[];
        if (waitingLanes.length > 0) {
            lane = waitingLanes[0];
            convergingLaneIndices = waitingLanes.slice(1);
        } else {
            lane = openLane(commit.hash);
            convergingLaneIndices = [];
        }

        const touchedLanes = new Set([lane, ...convergingLaneIndices]);
        const passThroughLanes = openLanesBefore
            .filter((i) => !touchedLanes.has(i))
            .map((i) => ({ lane: i, color: colorOf(i) }));

        // Capture converging lanes' colors before closing them.
        const convergingLanes = convergingLaneIndices.map((i) => ({
            lane: i,
            color: colorOf(i),
        }));
        convergingLaneIndices.forEach(closeLane);

        const color = colorOf(lane);
        const parentLanes: {
            hash: string;
            lane: number;
            color: string;
        }[] = [];

        commit.parents.forEach((parentHash, i) => {
            if (i === 0) {
                laneAwaits[lane] = parentHash;
                parentLanes.push({ hash: parentHash, lane, color });
                return;
            }
            const existing = findAllWaiting(parentHash);
            const parentLane =
                existing.length > 0 ? existing[0] : openLane(parentHash);
            parentLanes.push({
                hash: parentHash,
                lane: parentLane,
                color: colorOf(parentLane),
            });
        });

        if (commit.parents.length === 0) {
            closeLane(lane);
        }

        nodes.push({
            hash: commit.hash,
            lane,
            color,
            parentLanes,
            convergingLanes,
            passThroughLanes,
            isMergeCommit: commit.parents.length > 1,
            isNewBranchTip,
        });
    }

    return nodes;
}
