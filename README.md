# Obsidian Git Plugin

A powerful community plugin for [Obsidian.md](https://obsidian.md) that brings Git integration right into your vault. Automatically commit, pull, push, and see your changes — all within Obsidian.

> This is a fork of [Vinzent03/obsidian-git](https://github.com/Vinzent03/obsidian-git) with a reworked Source Control panel: a simplified toolbar, an embedded commit graph, and Stash/Tag support. Since it's a fork, it's **not listed in Obsidian's Community Plugins browser** — see [Installing this fork](#-installing-this-fork) below for how to get it.

## 📚 Documentation

All setup instructions (including mobile), common issues, tips, and advanced configuration can be found in the 📖 [full documentation](https://publish.obsidian.md/git-doc).

> Mobile users: The plugin is **highly unstable ⚠️ !** Please check the dedicated [Mobile](#-mobile-support-%EF%B8%8F--experimental) section below.

## 📦 Installing This Fork

Because this is a fork, Obsidian's built-in Community Plugins search won't find it. Use one of these instead:

### Option A: BRAT (recommended, gets updates automatically)

1. Install the [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) plugin from Community Plugins.

   ![Installing BRAT from Community Plugins](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-1-install.png)

2. Open BRAT's settings → **Add Beta Plugin**.

   ![BRAT settings, Add Beta Plugin button](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-2-add-beta-plugin.png)

3. Enter this repository: `WertC-14/obsidian-git`.

   ![Entering the repo in BRAT's Add Beta Plugin dialog](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-3-enter-repo.png)

4. Enable "Git" in **Settings → Community plugins** once BRAT installs it.

   ![Enabling Git in Community plugins after BRAT install](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-4-enable-plugin.png)

### Option B: Manual install

1. Go to this repo's [Releases page](https://github.com/WertC-14/obsidian-git/releases) and download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Create a folder `<your-vault>/.obsidian/plugins/obsidian-git/` and put those three files in it.
3. Reload Obsidian (or disable/re-enable the plugin) and enable "Git" in **Settings → Community plugins**.

> If you already have the original `obsidian-git` installed, disable/uninstall it first — both use the same plugin ID and will conflict.

## Key Features

- 🔁 **Automatic commit-and-sync** (commit, pull, and push) on a schedule.
- 📥 **Auto-pull on Obsidian startup**
- 📂 **Submodule support** for managing multiple repositories (desktop only and opt-in)
- 🔧 **Source Control View** to stage/unstage, commit and diff files - Open it with the `Open source control view` command.
- 🌿 **Commit Graph** showing branches as colored parallel lanes, merges, and tags - embedded in the Source Control view and available as a standalone History view.
- 📦 **Stash support** - stash, apply, pop, and drop changes without leaving Obsidian.
- 🏷️ **Tag support** - create and delete lightweight/annotated tags.
- 📜 **History View** for browsing commit logs and changed files - Open it with the `Open history view` command.
- 🔍 **Diff View** for viewing changes in a file - Open it with the `Open diff view` command.
- 📝 **Signs in the editor** to indicate added, modified, and deleted lines/hunks (desktop only).
- GitHub integration to open files and history in your browser

> For detailed file history, consider pairing this plugin with the [Version History Diff](obsidian://show-plugin?id=obsidian-version-history-diff) plugin.

## UI Previews

### 🔧 Source Control View

Manage your file changes directly inside Obsidian like stage/unstage individual files and commit them. The toolbar is a branch pill plus a "..." menu grouping every other action (Branch, Stash, Tags, Remote, etc.).

![Source Control View](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/source-view.png)

### 🌿 Commit Graph

Branches render as colored parallel lanes with merges, tag badges, and the current HEAD marked as a ring. Available embedded in the Source Control view (below Changes) and as a standalone History view.

![Commit Graph](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/commit-graph.png)

### 📦 Stash & 🏷️ Tags

Stash and unstash changes, and create/delete tags, from the "..." menu or the Command Palette - no need to drop into a terminal.

![Stash and Tags menu](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/stash-tags-menu.png)

### 📜 History View

Show the commit history of your repository. The commit message, author, date, and changed files can be shown. Author and date are disabled by default as shown in the screenshot, but can be enabled in the settings.

![History View](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/history-view.png)

### 🔍 Diff View 

Compare versions with a clear and concise diff viewer.
Open it from the source control view or via the `Open diff view` command.

![Diff View](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/diff-view.png)

### 📝 Signs in the Editor

View line-by-line changes directly in the editor with added, modified, and deleted line/hunk indicators. You can stage and reset changes right from the signs. There also commands to navigate between hunks and stage/reset hunks under the cursor. Needs to be enabled in the plugin settings.

![Signs](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/signs.png)

## Available Commands
> Not exhaustive - these are just some of the most common commands. For a full list, see the Command Palette in Obsidian.

- 🔄 Changes
  - `List changed files`: Lists all changes in a modal
  - `Open diff view`: Open diff view for the current file
  - `Stage current file`
  - `Unstage current file`
  - `Discard all changes`: Discard all changes in the repository
- ✅ Commit
  - `Commit`: If files are staged only commits those, otherwise commits only files that have been staged
  - `Commit with specific message`: Same as above, but with a custom message
  - `Commit all changes`: Commits all changes without pushing
  - `Commit all changes with specific message`: Same as above, but with a custom message
- 🔀 Commit-and-sync
  - `Commit-and-sync`: With default settings, this will commit all changes, pull, and push
  - `Commit-and-sync with specific message`: Same as above, but with a custom message
  - `Commit-and-sync and close`: Same as `Commit-and-sync`, but if running on desktop, will close the Obsidian window. Will not exit Obsidian app on mobile.
- 🌐 Remote
  - `Push`, `Pull`
  - `Edit remotes`: Add new remotes or edit existing remotes
  - `Remove remote`
  - `Clone an existing remote repo`: Opens dialog that will prompt for URL and authentication to clone a remote repo
  - `Open file on GitHub`: Open the file view of the current file on GitHub in a browser window. Note: only works on desktop
  - `Open file history on GitHub`: Open the file history of the current file on GitHub in a browser window. Note: only works on desktop
- 🏠 Manage local repository
  - `Initialize a new repo`
  - `Create new branch`
  - `Delete branch`
  - `Switch branch`, `Switch to remote branch`
  - `Fetch`
  - `CAUTION: Delete repository`
- 📦 Stash
  - `Stash changes`
  - `Apply stash`
  - `Pop stash`
  - `Drop stash`
- 🏷️ Tags
  - `Create tag`
  - `Delete tag`
- 🧪 Miscellaneous
  - `Open source control view`: Opens side pane displaying [Source control view](#sidebar-view)
  - `Open history view`: Opens side pane displaying [History view](#history-view)
  - `Edit .gitignore`
  - `Add file to .gitignore`: Add current file to `.gitignore`

## 💻 Desktop Notes

### 🔐 Authentication

Some Git services may require further setup for HTTPS/SSH authentication. Refer to the [Authentication Guide](https://publish.obsidian.md/git-doc/Authentication)

### Obsidian on Linux

- ⚠️  Snap is not supported due to its sandboxing restrictions.
- ⚠️  Flatpak is not recommended, because it doesn't have access to all system files. They are actively fixing many issues, but there are still issues. Especially with more advanced setups.
- ✅ Please use AppImage or a full access installation of your system's package manager instead ([Linux installation guide](https://publish.obsidian.md/git-doc/Installation#Linux))

## 📱 Mobile Support (⚠️  Experimental)

The Git implementation on mobile is **very unstable**! I would not recommend using this plugin on mobile, but try other syncing services.

One such alternative is [GitSync](https://github.com/ViscousPot/GitSync), which is available on both Android and iOS. It is not associated with this plugin, but it may be a better option for mobile users. A tutorial for setting it up can be found [here](https://viscouspotenti.al/posts/gitsync-all-devices-tutorial).

> 🧪 The Git plugin works on mobile thanks to [isomorphic-git](https://isomorphic-git.org/), a JavaScript-based re-implementation of Git - but it comes with serious limitations and issues. It is not possible for an Obsidian plugin to use a native Git installation on Android or iOS.

### ❌ Mobile Feature Limitations

- No **SSH authentication** ([isomorphic-git issue](https://github.com/isomorphic-git/isomorphic-git/issues/231))
- Limited repo size, because of memory restrictions
- No rebase merge strategy
- No submodules support

### ⚠️ Performance Caveats

> [!caution]
> Depending on your device and available free RAM, Obsidian may
>
> - crash on clone/pull
> - create buffer overflow errors
> - run indefinitely.
>
> It's caused by the underlying git implementation on mobile, which is not efficient. I don't know how to fix this. If that's the case for you, I have to admit this plugin won't work for you. So commenting on any issue or creating a new one won't help. I am sorry.

### Tips for Mobile Use:

If you have a large repo/vault I recommend to stage individual files and only commit staged files.

## 🙋 Contact & Credits

- The Line Authoring feature was developed by [GollyTicker](https://github.com/GollyTicker), so any questions may be best answered by her.
- This plugin was initial developed by [denolehov](https://github.com/denolehov). Since March 2021, it's [Vinzent03](https://github.com/Vinzent03) who is developing the upstream plugin. That's why the GitHub repository got moved to their account in July 2024.
- This fork's Source Control panel rework (commit graph, Stash/Tags, reorganized toolbar/menu) is maintained by [WertC-14](https://github.com/WertC-14).
- If you have any kind of feedback or questions, feel free to reach out via GitHub issues.

## ☕ Support

If you find this plugin useful and would like to support its development, you can support me on Ko-fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F195IQ5)
