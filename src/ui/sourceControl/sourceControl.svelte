<script lang="ts">
    import { Menu, Platform, Scope, setIcon } from "obsidian";
    import { SOURCE_CONTROL_VIEW_CONFIG } from "src/constants";
    import type ObsidianGit from "src/main";
    import type {
        FileStatusResult,
        Status,
        StatusRootTreeItem,
    } from "src/types";
    import { FileType } from "src/types";
    import { arrayProxyWithNewLength, getDisplayPath, plural } from "src/utils";
    import { slide } from "svelte/transition";
    import FileComponent from "./components/fileComponent.svelte";
    import PulledFileComponent from "./components/pulledFileComponent.svelte";
    import StagedFileComponent from "./components/stagedFileComponent.svelte";
    import TreeComponent from "./components/treeComponent.svelte";
    import type GitView from "./sourceControl";
    import TooManyFilesComponent from "./components/tooManyFilesComponent.svelte";
    import { onMount } from "svelte";

    interface Props {
        plugin: ObsidianGit;
        view: GitView;
    }

    let { plugin, view }: Props = $props();
    let loading: boolean = $state(false);
    let status: Status | undefined = $state();
    let lastPulledFiles: FileStatusResult[] = $state([]);
    let commitMessage = $derived(plugin.settings.commitMessage);
    let buttons: HTMLElement[] = $state([]);
    let changeHierarchy: StatusRootTreeItem | undefined = $state();
    let stagedHierarchy: StatusRootTreeItem | undefined = $state();
    let lastPulledFilesHierarchy: StatusRootTreeItem | undefined = $state();
    let changesOpen = $state(true);
    let stagedOpen = $state(true);
    let lastPulledFilesOpen = $state(true);
    let unPushedCommits = $state(0);
    let currentBranch: string | undefined = $state();
    let stagedClosed: Record<string, boolean> = $state({});
    let unstagedClosed: Record<string, boolean> = $state({});
    let pulledClosed: Record<string, boolean> = $state({});

    let showTree = $derived(plugin.settings.treeStructure);
    onMount(() => {
        view.registerEvent(
            view.app.workspace.on(
                "obsidian-git:loading-status",
                () => (loading = true)
            )
        );
        view.registerEvent(
            view.app.workspace.on(
                "obsidian-git:status-changed",
                () => void refresh().catch(console.error)
            )
        );
        if (view.plugin.cachedStatus == undefined) {
            view.plugin.refresh().catch(console.error);
        } else {
            refresh().catch(console.error);
        }

        view.scope = new Scope(plugin.app.scope);
        view.scope.register(["Ctrl"], "Enter", (_: KeyboardEvent) =>
            commitAndSync()
        );
    });
    $effect(() => {
        buttons.forEach((btn) => setIcon(btn, btn.getAttr("data-icon")!));
    });

    $effect(() => {
        // highlight push button if there are unpushed commits
        buttons.forEach((btn) => {
            // when reloading the view from settings change, the btn are null at first
            if (!btn || btn.id != "push") return;
            if (Platform.isMobile) {
                btn.removeClass("button-border");
                if (unPushedCommits > 0) {
                    btn.addClass("button-border");
                }
            } else {
                btn.firstElementChild?.removeAttribute("color");
                if (unPushedCommits > 0) {
                    btn.firstElementChild?.setAttr(
                        "color",
                        "var(--text-accent)"
                    );
                }
            }
        });
    });

    function commit() {
        loading = true;
        if (status) {
            const onlyStaged = status.staged.length > 0;
            plugin.promiseQueue.addTask(() =>
                plugin
                    .commit({ fromAuto: false, commitMessage, onlyStaged })
                    .then(() => (commitMessage = plugin.settings.commitMessage))
                    .finally(triggerRefresh)
            );
        }
    }

    function commitAndSync() {
        loading = true;
        if (status) {
            // If staged files exist only commit them, but if not, commit all.
            // I hope this is the most intuitive way.
            const onlyStaged = status.staged.length > 0;
            plugin.promiseQueue.addTask(() =>
                plugin
                    .commitAndSync({
                        fromAutoBackup: false,
                        commitMessage,
                        onlyStaged,
                    })
                    .then(() => {
                        commitMessage = plugin.settings.commitMessage;
                    })
                    .finally(triggerRefresh)
            );
        }
    }

    async function refresh(): Promise<void> {
        if (!plugin.gitReady) {
            status = undefined;
            currentBranch = undefined;
            return;
        }
        unPushedCommits = await plugin.gitManager.getUnpushedCommits();
        currentBranch = (await plugin.gitManager.branchInfo()).current;

        status = plugin.cachedStatus;
        loading = false;
        if (
            plugin.lastPulledFiles &&
            plugin.lastPulledFiles != lastPulledFiles
        ) {
            lastPulledFiles = plugin.lastPulledFiles;

            lastPulledFilesHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(lastPulledFiles),
            };
        }
        if (status) {
            const sort = (a: FileStatusResult, b: FileStatusResult) => {
                return a.vaultPath
                    .split("/")
                    .last()!
                    .localeCompare(getDisplayPath(b.vaultPath));
            };
            status.changed.sort(sort);
            status.staged.sort(sort);
            changeHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(status.changed),
            };
            stagedHierarchy = {
                title: "",
                path: "",
                vaultPath: "",
                children: plugin.gitManager.getTreeStructure(status.staged),
            };
        } else {
            changeHierarchy = undefined;
            stagedHierarchy = undefined;
        }
    }

    function triggerRefresh() {
        view.app.workspace.trigger("obsidian-git:refresh");
    }

    function stageAll(event: Event) {
        event.stopPropagation();
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.gitManager
                .stageAll({ status: status })
                .finally(triggerRefresh)
        );
    }

    function unstageAll(event: Event) {
        event.stopPropagation();
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.gitManager
                .unstageAll({ status: status })
                .finally(triggerRefresh)
        );
    }

    function push() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.push().finally(triggerRefresh)
        );
    }
    function pull() {
        loading = true;
        plugin.promiseQueue.addTask(() =>
            plugin.pullChangesFromRemote().finally(triggerRefresh)
        );
    }
    function discard(event: Event) {
        event.stopPropagation();
        void plugin.discardAll();
    }

    function switchBranch() {
        void plugin.switchBranch();
    }

    function toggleLayout() {
        showTree = !showTree;
        plugin.settings.treeStructure = showTree;
        void plugin.saveSettings();
    }

    function openMoreActionsMenu(event: MouseEvent) {
        const menu = new Menu();
        menu.addItem((item) =>
            item
                .setTitle("Commit and sync")
                .setIcon("arrow-up-circle")
                .onClick(commitAndSync)
        );
        menu.addItem((item) =>
            item.setTitle("Pull").setIcon("download").onClick(pull)
        );
        menu.addSeparator();
        menu.addItem((item) =>
            item
                .setTitle("Stage all changes")
                .setIcon("plus-circle")
                .onClick(stageAll)
        );
        menu.addItem((item) =>
            item
                .setTitle("Unstage all changes")
                .setIcon("minus-circle")
                .onClick(unstageAll)
        );
        menu.addItem((item) =>
            item
                .setTitle("Discard all changes")
                .setIcon("undo")
                .setWarning(true)
                .onClick(discard)
        );
        menu.addSeparator();
        menu.addItem((item) =>
            item
                .setTitle(
                    showTree ? "Switch to list view" : "Switch to tree view"
                )
                .setIcon(showTree ? "list" : "folder")
                .onClick(toggleLayout)
        );
        menu.showAtMouseEvent(event);
    }

    function openCommitOptionsMenu(event: MouseEvent) {
        const menu = new Menu();
        menu.addItem((item) =>
            item
                .setTitle("Commit and sync")
                .setIcon("arrow-up-circle")
                .onClick(commitAndSync)
        );
        menu.showAtMouseEvent(event);
    }

    let rows = $derived((commitMessage.match(/\n/g) || []).length + 1 || 1);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<main data-type={SOURCE_CONTROL_VIEW_CONFIG.type} class="git-view">
    <div class="nav-header">
        <div class="nav-buttons-container git-toolbar">
            {#if currentBranch}
                <div
                    class="git-branch-pill clickable-icon"
                    aria-label="Switch branch"
                    onclick={switchBranch}
                >
                    <div
                        class="git-branch-pill-icon"
                        data-icon="git-branch"
                        bind:this={buttons[0]}
                    ></div>
                    <span class="git-branch-pill-label">{currentBranch}</span>
                </div>
            {/if}
            <div class="git-toolbar-spacer"></div>
            <div
                id="refresh"
                class="clickable-icon nav-action-button"
                class:loading
                data-icon="refresh-cw"
                aria-label="Refresh"
                bind:this={buttons[1]}
                onclick={triggerRefresh}
            ></div>
            <div
                class="git-toolbar-item"
                aria-label={unPushedCommits > 0
                    ? `Push (${plural(unPushedCommits, "commit")} ahead)`
                    : "Push"}
            >
                <div
                    id="push"
                    class="clickable-icon nav-action-button"
                    data-icon="upload"
                    bind:this={buttons[2]}
                    onclick={push}
                ></div>
                {#if unPushedCommits > 0}
                    <span class="git-badge">{unPushedCommits}</span>
                {/if}
            </div>
            <div
                id="more-actions"
                class="clickable-icon nav-action-button"
                data-icon="more-horizontal"
                aria-label="More actions"
                bind:this={buttons[3]}
                onclick={openMoreActionsMenu}
            ></div>
        </div>
    </div>
    <div class="git-commit-msg">
        <textarea
            {rows}
            class="commit-msg-input"
            spellcheck="true"
            placeholder="Commit Message"
            bind:value={commitMessage}
        ></textarea>
        {#if commitMessage}
            <div
                class="git-commit-msg-clear-button"
                onclick={() => (commitMessage = "")}
                aria-label={"Clear"}
            ></div>
        {/if}
    </div>
    <div class="git-commit-actions">
        <button
            id="commit-btn"
            class="mod-cta git-commit-button"
            aria-label="Commit (Ctrl+Enter for commit and sync)"
            onclick={commit}
        >
            Commit{#if status && status.staged.length > 0}
                &nbsp;({status.staged.length}){/if}
        </button>
        <button
            class="mod-cta git-commit-dropdown-toggle clickable-icon"
            aria-label="More commit actions"
            data-icon="chevron-down"
            bind:this={buttons[4]}
            onclick={openCommitOptionsMenu}
        ></button>
    </div>

    <div class="nav-files-container" style="position: relative;">
        {#if status && stagedHierarchy && changeHierarchy}
            <div class="tree-item nav-folder mod-root">
                <div
                    class="staged tree-item nav-folder"
                    class:is-collapsed={!stagedOpen}
                >
                    <div
                        class="tree-item-self is-clickable nav-folder-title"
                        onclick={() => (stagedOpen = !stagedOpen)}
                    >
                        <div
                            class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                            class:is-collapsed={!stagedOpen}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon right-triangle"
                                ><path d="M3 8L12 17L21 8" /></svg
                            >
                        </div>
                        <div class="tree-item-inner nav-folder-title-content">
                            Staged Changes
                        </div>

                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="minus"
                                    aria-label="Unstage"
                                    bind:this={buttons[8]}
                                    onclick={unstageAll}
                                    class="clickable-icon"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 18 18"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="svg-icon lucide-minus"
                                        ><line
                                            x1="4"
                                            y1="9"
                                            x2="14"
                                            y2="9"
                                        /></svg
                                    >
                                </div>
                            </div>
                            <div class="files-count">
                                {status.staged.length}
                            </div>
                        </div>
                    </div>
                    {#if stagedOpen}
                        <div
                            class="tree-item-children nav-folder-children"
                            transition:slide|local={{ duration: 150 }}
                        >
                            {#if showTree}
                                <TreeComponent
                                    hierarchy={stagedHierarchy}
                                    {plugin}
                                    {view}
                                    fileType={FileType.staged}
                                    topLevel={true}
                                    bind:closed={stagedClosed}
                                />
                            {:else}
                                {#each arrayProxyWithNewLength(status.staged, 500) as stagedFile}
                                    <StagedFileComponent
                                        change={stagedFile}
                                        {view}
                                        manager={plugin.gitManager}
                                    />
                                {/each}
                                <TooManyFilesComponent files={status.staged} />
                            {/if}
                        </div>
                    {/if}
                </div>
                <div
                    class="changes tree-item nav-folder"
                    class:is-collapsed={!changesOpen}
                >
                    <div
                        onclick={() => (changesOpen = !changesOpen)}
                        class="tree-item-self is-clickable nav-folder-title"
                    >
                        <div
                            class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                            class:is-collapsed={!changesOpen}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="svg-icon right-triangle"
                                ><path d="M3 8L12 17L21 8" /></svg
                            >
                        </div>

                        <div class="tree-item-inner nav-folder-title-content">
                            Changes
                        </div>
                        <div class="git-tools">
                            <div class="buttons">
                                <div
                                    data-icon="undo"
                                    aria-label="Discard"
                                    onclick={discard}
                                    class="clickable-icon"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="svg-icon lucide-undo"
                                        ><path d="M3 7v6h6" /><path
                                            d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"
                                        /></svg
                                    >
                                </div>
                                <div
                                    data-icon="plus"
                                    aria-label="Stage"
                                    bind:this={buttons[9]}
                                    onclick={stageAll}
                                    class="clickable-icon"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="svg-icon lucide-plus"
                                        ><line
                                            x1="12"
                                            y1="5"
                                            x2="12"
                                            y2="19"
                                        /><line
                                            x1="5"
                                            y1="12"
                                            x2="19"
                                            y2="12"
                                        /></svg
                                    >
                                </div>
                            </div>
                            <div class="files-count">
                                {status.changed.length}
                            </div>
                        </div>
                    </div>
                    {#if changesOpen}
                        <div
                            class="tree-item-children nav-folder-children"
                            transition:slide|local={{ duration: 150 }}
                        >
                            {#if showTree}
                                <TreeComponent
                                    hierarchy={changeHierarchy}
                                    {plugin}
                                    {view}
                                    fileType={FileType.changed}
                                    topLevel={true}
                                    bind:closed={unstagedClosed}
                                />
                            {:else}
                                {#each arrayProxyWithNewLength(status.changed, 500) as change}
                                    <FileComponent
                                        {change}
                                        {view}
                                        manager={plugin.gitManager}
                                    />
                                {/each}
                                <TooManyFilesComponent files={status.changed} />
                            {/if}
                        </div>
                    {/if}
                </div>
                {#if lastPulledFiles.length > 0 && lastPulledFilesHierarchy}
                    <div
                        class="pulled nav-folder"
                        class:is-collapsed={!lastPulledFilesOpen}
                    >
                        <div
                            class="tree-item-self is-clickable nav-folder-title"
                            onclick={() =>
                                (lastPulledFilesOpen = !lastPulledFilesOpen)}
                        >
                            <div
                                class="tree-item-icon nav-folder-collapse-indicator collapse-icon"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="svg-icon right-triangle"
                                    ><path d="M3 8L12 17L21 8" /></svg
                                >
                            </div>

                            <div
                                class="tree-item-inner nav-folder-title-content"
                            >
                                Recently Pulled Files
                            </div>

                            <span class="tree-item-flair"
                                >{lastPulledFiles.length}</span
                            >
                        </div>
                        {#if lastPulledFilesOpen}
                            <div
                                class="tree-item-children nav-folder-children"
                                transition:slide|local={{ duration: 150 }}
                            >
                                {#if showTree}
                                    <TreeComponent
                                        hierarchy={lastPulledFilesHierarchy}
                                        {plugin}
                                        {view}
                                        fileType={FileType.pulled}
                                        topLevel={true}
                                        bind:closed={pulledClosed}
                                    />
                                {:else}
                                    {#each lastPulledFiles as change}
                                        <PulledFileComponent {change} {view} />
                                    {/each}
                                    <TooManyFilesComponent
                                        files={lastPulledFiles}
                                    />
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</main>

<style lang="scss">
    .commit-msg-input {
        width: 100%;
        overflow: hidden;
        resize: none;
        padding: 7px 5px;
        background-color: var(--background-modifier-form-field);
    }

    .git-commit-msg {
        position: relative;
        padding: 0;
        width: calc(100% - var(--size-4-8));
        margin: 4px auto;
    }
    main {
        .git-tools {
            .files-count {
                padding-left: var(--size-2-1);
                width: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    .nav-folder-title {
        align-items: center;
    }

    .git-commit-msg-clear-button {
        position: absolute;
        background: transparent;
        border-radius: 50%;
        color: var(--search-clear-button-color);
        cursor: var(--cursor);
        top: -4px;
        right: 2px;
        bottom: 0px;
        line-height: 0;
        height: var(--input-height);
        width: 28px;
        margin: auto;
        padding: 0 0;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: color 0.15s ease-in-out;
    }

    .git-toolbar {
        display: flex;
        align-items: center;
        gap: var(--size-2-1);
    }

    .git-toolbar-spacer {
        flex: 1 1 auto;
    }

    .git-toolbar-item {
        position: relative;
        display: flex;
    }

    .git-branch-pill {
        display: flex;
        align-items: center;
        gap: var(--size-2-1);
        padding: 2px var(--size-4-2);
        border-radius: var(--radius-s);
        background-color: var(--interactive-accent);
        color: var(--text-on-accent);
        font-size: var(--font-ui-smaller);
        overflow: hidden;

        &:hover {
            background-color: var(--interactive-accent-hover);
        }
    }

    .git-branch-pill-icon {
        display: flex;
        flex: 0 0 auto;
    }

    .git-branch-pill-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .git-badge {
        position: absolute;
        top: 0;
        right: 0;
        min-width: 14px;
        height: 14px;
        padding: 0 3px;
        border-radius: 999px;
        background-color: var(--interactive-accent);
        color: var(--text-on-accent);
        font-size: var(--font-ui-smaller);
        line-height: 14px;
        text-align: center;
        pointer-events: none;
    }

    .git-commit-actions {
        display: flex;
        width: calc(100% - var(--size-4-8));
        margin: 0 auto var(--size-4-2) auto;
    }

    .git-commit-button {
        flex: 1 1 auto;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .git-commit-dropdown-toggle {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        padding: 0;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 1px solid var(--background-modifier-border);
    }

    .git-commit-msg-clear-button:after {
        content: "";
        height: var(--search-clear-button-size);
        width: var(--search-clear-button-size);
        display: block;
        background-color: currentColor;
        mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
        mask-repeat: no-repeat;
        -webkit-mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
        -webkit-mask-repeat: no-repeat;
    }
</style>
