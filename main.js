/*
 * Section Blocks 1.3.0 - by paipa, MIT License
 * https://github.com/Paipa03/obsidian-section-blocks
 */

"use strict";

// ---- i18n ----
// UI text is English; PAIPA_ZH maps each English string to Simplified Chinese.
// The language comes from the plugin's "language" setting ("auto" follows Obsidian).
let paipaLang = "auto";
function paipaObsidianLang() {
  try {
    const o = require("obsidian");
    const l = (typeof o.getLanguage === "function" && o.getLanguage()) || window.localStorage.getItem("language") || "en";
    return /^zh/i.test(String(l)) ? "zh" : "en";
  } catch (e) { return "en"; }
}
function paipaEffectiveLang() {
  return paipaLang === "auto" ? paipaObsidianLang() : paipaLang;
}
var PAIPA_ZH = {
  "Language": "语言",
  "Follow Obsidian's language, or choose one for this plugin.": "跟随 Obsidian 的语言，或为本插件单独选择。",
  "Follow Obsidian": "跟随 Obsidian",
  "Make link and page": "生成链接和页面",
  "Already a link": "已经是链接",
  "Archive": "归档",
  "Restore": "恢复",
  "Collapse archive": "折叠归档",
  "Expand archive": "展开归档",
  "Link to a section, heading or note…": "链接到分区、标题或笔记…",
  "Section": "分区",
  "Heading": "标题",
  "Note": "笔记",
  "Rename entry": "重命名条目",
  "Label": "名称",
  "Save": "保存",
  "Cancel": "取消",
  "Index": "索引",
  "Title": "标题",
  "Optional caption in front of the entries.": "可选，显示在条目前面的说明文字。",
  "none": "无",
  "List sections automatically": "自动列出分区",
  "Every section of this note is listed in document order and follows renames and moves.": "按文档顺序列出本笔记的每个分区，并跟随重命名和移动自动更新。",
  "Hidden sections": "已隐藏的分区",
  "Show all": "全部显示",
  "Entries": "条目",
  "Links you added. They follow the sections.": "你手动添加的链接，排在分区之后。",
  "No entries of your own yet.": "还没有手动添加的条目。",
  "Change target": "更改目标",
  "Move up": "上移",
  "Move down": "下移",
  "Remove": "移除",
  "Add entry": "添加条目",
  "Back to top": "回到顶部",
  "Create section": "创建分区",
  "Insert index at top": "在顶部插入索引",
  "Insert index here": "在此处插入索引",
  "Organize section pages of this note": "整理本笔记的分区页面",
  "Organize media of this note": "整理本笔记的媒体文件",
  "Organize media of every note": "整理所有笔记的媒体文件",
  "Moved {count} page(s).": "已移动 {count} 个页面。",
  "Section pages are already in place.": "分区页面都已在正确位置。",
  "Moved {count} media file(s).": "已移动 {count} 个媒体文件。",
  "Media files are already in place.": "媒体文件都已在正确位置。",
  "Moved {count} item(s).": "已移动 {count} 项。",
  "Could not find this index block in the note.": "在笔记中找不到这个索引块。",
  "This index could not be read.": "无法读取这个索引。",
  "Reset": "重置",
  "Empty index": "空索引",
  "Edit index": "编辑索引",
  "Add entry…": "添加条目…",
  "Edit index…": "编辑索引…",
  "Open in new tab": "在新标签页中打开",
  "Rename…": "重命名…",
  "Change target…": "更改目标…",
  "Move left": "左移",
  "Move right": "右移",
  "Pages root": "页面根目录",
  "Section pages are created in <root>/<Section title>/. Leave empty for the vault root.": "分区页面创建在 <根目录>/<分区标题>/ 中。留空则使用仓库根目录。",
  "vault root": "仓库根目录",
  "Organize media": "整理媒体文件",
  'Keep every image / video a note shows in a "<note name> media" folder beside the note: files dropped or pasted into the note (or into one of its galleries) are created there, and media the note embeds from elsewhere is moved there. Files already in another note\'s media folder stay put.': "把笔记显示的每张图片 / 每个视频放进笔记旁边的“<笔记名> media”文件夹：拖入或粘贴到笔记（或其画廊）中的文件直接创建在那里，笔记从别处嵌入的媒体会移到那里。已在其他笔记媒体文件夹中的文件保持不动。"
};
function paipaT(en, vars) {
  let s = paipaEffectiveLang() === "zh" && Object.prototype.hasOwnProperty.call(PAIPA_ZH, en) ? PAIPA_ZH[en] : en;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m);
  return s;
}
// ---- end i18n ----
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// core.js
var require_core = __commonJS({
  "core.js"(exports2, module2) {
    "use strict";
    var OPEN_RE = /^\s*%%\s*sb-archive\s+(\{.*\})\s*%%\s*$/;
    var CLOSE_RE = /^\s*%%\s*\/sb-archive\s*%%\s*$/;
    var HEADING_RE = /^(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;
    var FENCE_RE = /^\s*(`{3,}|~{3,})(.*)$/;
    var NSB_OPEN_RE = /%%\s*nsb-toggle\s+\{.*\}\s*%%\s*$/;
    var LINK_RE = /^\[\[([^\]|#]+)(#[^\]|]*)?(\|[^\]]*)?\]\]$/;
    var BAD_NAME_RE = /[\\/:*?"<>|#^[\]]/g;
    function marker(meta) {
      const out = Object.assign({}, meta || {});
      out.open = meta && meta.open === true;
      return "%% sb-archive " + JSON.stringify(out) + " %%";
    }
    function parseMeta(line) {
      const m = OPEN_RE.exec(line);
      if (!m) return null;
      try {
        const meta = JSON.parse(m[1]);
        return meta && typeof meta === "object" ? meta : {};
      } catch (_) {
        return null;
      }
    }
    function headingText(line) {
      const m = HEADING_RE.exec(line);
      return m && m[2] ? m[2].replace(NSB_OPEN_RE, "").trim() : "";
    }
    function isMarkerLine(line) {
      return OPEN_RE.test(line) || CLOSE_RE.test(line);
    }
    function rowKind(line) {
      const s = line.trim();
      if (!s) return "blank";
      if (LINK_RE.test(s)) return "link";
      if (/^([#>|]|[-*+]\s|\d+[.)]\s|`{3}|~{3}|%%|!\[|<)/.test(s)) return "other";
      if (/^[-*_]{3,}$/.test(s) || NSB_OPEN_RE.test(s)) return "other";
      if (/[[\]`]|\]\(/.test(s)) return "other";
      return "text";
    }
    function linkName(line) {
      const m = LINK_RE.exec(line.trim());
      return m ? m[1].trim() : null;
    }
    function safeName(text) {
      return text.replace(BAD_NAME_RE, "").replace(/\s+/g, " ").trim();
    }
    function scan(text) {
      const lines = text.split("\n"), starts = [];
      let offset = 0;
      for (const line of lines) {
        starts.push(offset);
        offset += line.length + 1;
      }
      const sections = [], headings = [], fenced = /* @__PURE__ */ new Set();
      let fence = null, open = -1, prevClose = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i], fm = FENCE_RE.exec(line);
        if (fence) {
          fenced.add(i);
          if (fm && fm[1][0] === fence.ch && fm[1].length >= fence.len && !fm[2].trim()) fence = null;
          continue;
        }
        if (fm) {
          fence = { ch: fm[1][0], len: fm[1].length };
          fenced.add(i);
          continue;
        }
        if (open < 0) {
          if (HEADING_RE.test(line)) headings.push(i);
          else if (OPEN_RE.test(line) && parseMeta(line)) open = i;
          continue;
        }
        if (!CLOSE_RE.test(line)) continue;
        let titleLine = -1;
        for (let h = headings.length - 1; h >= 0; h--) if (headings[h] > prevClose && headings[h] < open) {
          titleLine = headings[h];
          break;
        }
        const meta = parseMeta(lines[open]);
        const row = (n) => ({ line: n, from: starts[n], to: starts[n] + lines[n].length, text: lines[n], kind: fenced.has(n) ? "other" : rowKind(lines[n]) });
        const rows = [], items = [];
        for (let n = titleLine + 1; n < open && titleLine >= 0; n++) rows.push(row(n));
        for (let n = open + 1; n < i; n++) items.push(row(n));
        sections.push({
          titleLine,
          title: titleLine >= 0 ? headingText(lines[titleLine]) : "",
          titleFrom: titleLine >= 0 ? starts[titleLine] : -1,
          titleTo: titleLine >= 0 ? starts[titleLine] + lines[titleLine].length : -1,
          openLine: open,
          openFrom: starts[open],
          openTo: starts[open] + lines[open].length,
          closeLine: i,
          closeFrom: starts[i],
          closeTo: starts[i] + lines[i].length,
          startLine: titleLine >= 0 ? titleLine : open,
          open: meta.open === true,
          meta,
          rows,
          items
        });
        prevClose = i;
        open = -1;
      }
      return sections;
    }
    function sectionAt(sections, line) {
      return sections.find((s) => line >= s.startLine && line <= s.closeLine) || null;
    }
    function rowAt(sections, line) {
      for (const s of sections) {
        const r = s.rows.find((r2) => r2.line === line);
        if (r) return { section: s, row: r, area: "rows" };
        const i = s.items.find((r2) => r2.line === line);
        if (i) return { section: s, row: i, area: "items" };
      }
      return null;
    }
    function lastFilled(list) {
      for (let i = list.length - 1; i >= 0; i--) if (list[i].kind !== "blank") return list[i];
      return null;
    }
    function moveRow(text, line, toArchive) {
      const hit = rowAt(scan(text), line);
      if (!hit || hit.row.kind !== "text" && hit.row.kind !== "link") return null;
      if (toArchive ? hit.area !== "rows" : hit.area !== "items") return null;
      const { section: s, row } = hit;
      const dest = toArchive ? s.items : s.rows, anchor = lastFilled(dest);
      const at = anchor ? anchor.to + 1 : toArchive ? s.openTo + 1 : s.titleLine >= 0 ? s.titleTo + 1 : s.openFrom;
      const remove = { from: row.from, to: row.to + 1, insert: "" };
      return [remove, { from: at, to: at, insert: row.text + "\n" }].sort((a, b) => a.from - b.from);
    }
    function toggleArchive(text, line, open) {
      const s = sectionAt(scan(text), line);
      if (!s) return null;
      return { from: s.openFrom, to: s.openTo, insert: marker(Object.assign({}, s.meta, { open: open === void 0 ? !s.open : !!open })) };
    }
    function linkify(text, line) {
      const hit = rowAt(scan(text), line);
      if (!hit || hit.row.kind !== "text") return null;
      const raw = hit.row.text, lead = raw.length - raw.trimStart().length, words = raw.trim();
      const name = safeName(words);
      if (!name) return null;
      const link = name === words ? "[[" + name + "]]" : "[[" + name + "|" + words + "]]";
      return { name, change: { from: hit.row.from + lead, to: hit.row.from + lead + words.length, insert: link } };
    }
    function sectionText(title) {
      return "# " + title + "\n\n\n" + marker({ open: false }) + "\n%% /sb-archive %%";
    }
    function wellFormed(text) {
      let open = false, fence = null;
      for (const line of text.split("\n")) {
        const fm = FENCE_RE.exec(line);
        if (fence) {
          if (fm && fm[1][0] === fence.ch && fm[1].length >= fence.len && !fm[2].trim()) fence = null;
          continue;
        }
        if (fm) {
          fence = { ch: fm[1][0], len: fm[1].length };
          continue;
        }
        if (!/sb-archive/.test(line)) continue;
        if (OPEN_RE.test(line)) {
          if (open) return false;
          open = true;
          continue;
        }
        if (CLOSE_RE.test(line)) {
          if (!open) return false;
          open = false;
          continue;
        }
        if (/%%\s*\/?sb-archive/.test(line)) return false;
      }
      return !open;
    }
    function releaseSection(text, line) {
      const s = sectionAt(scan(text), line);
      if (!s) return null;
      const spans = [[s.openFrom, s.openTo], [s.closeFrom, s.closeTo]];
      if (s.titleLine >= 0) spans.unshift([s.titleFrom, s.titleTo]);
      const changes = [];
      for (const [from, to] of spans) {
        const last = changes[changes.length - 1];
        if (last && last.to >= from) last.to = Math.min(text.length, to + 1);
        else changes.push({ from, to: Math.min(text.length, to + 1), insert: "" });
      }
      const tail = changes[changes.length - 1];
      if (tail.to === text.length && tail.from > 0 && text[tail.to - 1] !== "\n") tail.from -= 1;
      return changes;
    }
    function headingLink(title) {
      return "#" + String(title).replace(/[[\]#|^:%]/g, " ").replace(/\s+/g, " ").trim();
    }
    function linkLabel(link) {
      const at = link.indexOf("#"), path = at < 0 ? link : link.slice(0, at), sub = at < 0 ? "" : link.slice(at + 1);
      return (sub ? sub.split("#").pop() : path.split("/").pop().replace(/\.md$/i, "")).trim() || link;
    }
    function parseIndex(source) {
      const s = (source || "").trim();
      if (!s) return { title: "", auto: true, items: [], hidden: [] };
      try {
        const raw = JSON.parse(s);
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const items = (Array.isArray(raw.items) ? raw.items : []).filter((i) => i && typeof i.link === "string" && i.link.trim()).map((i) => ({ label: typeof i.label === "string" && i.label.trim() ? i.label.trim() : linkLabel(i.link.trim()), link: i.link.trim() }));
        return {
          title: typeof raw.title === "string" ? raw.title.trim() : "",
          auto: raw.auto !== false,
          items,
          hidden: (Array.isArray(raw.hidden) ? raw.hidden : []).filter((h) => typeof h === "string")
        };
      } catch (_) {
        return null;
      }
    }
    function serializeIndex(model, indent = "") {
      const bare = !model.title && model.auto && !model.items.length && !model.hidden.length;
      const body = bare ? [] : [JSON.stringify({ title: model.title, auto: model.auto, items: model.items, hidden: model.hidden })];
      return ["```sb-index", ...body, "```"].map((l) => indent + l).join("\n");
    }
    function indexEntries(model, titles) {
      const out = [];
      if (model.auto) for (const title of titles) {
        const link = headingLink(title);
        if (title && !model.hidden.includes(link) && !model.items.some((i) => i.link === link)) out.push({ label: title, link, auto: true });
      }
      model.items.forEach((item, at) => out.push({ label: item.label, link: item.link, auto: false, at }));
      return out;
    }
    function addIndexEntry(model, entry) {
      const hidden = model.hidden.filter((h) => h !== entry.link);
      if (model.items.some((i) => i.link === entry.link) || model.auto && hidden.length !== model.hidden.length) return Object.assign({}, model, { hidden });
      return Object.assign({}, model, { hidden, items: model.items.concat([{ label: entry.label || linkLabel(entry.link), link: entry.link }]) });
    }
    function removeIndexEntry(model, entry) {
      if (entry.auto) return Object.assign({}, model, { hidden: model.hidden.concat([entry.link]) });
      return Object.assign({}, model, { items: model.items.filter((_, i) => i !== entry.at) });
    }
    function moveIndexEntry(model, at, delta) {
      const to = at + delta;
      if (at < 0 || to < 0 || at >= model.items.length || to >= model.items.length) return model;
      const items = model.items.slice(), [item] = items.splice(at, 1);
      items.splice(to, 0, item);
      return Object.assign({}, model, { items });
    }
    function editIndexEntry(model, at, patch) {
      return Object.assign({}, model, { items: model.items.map((item, i) => i === at ? Object.assign({}, item, patch) : item) });
    }
    function indexBlocks(text) {
      const lines = text.split("\n"), out = [];
      let offset = 0, fence = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i], m = FENCE_RE.exec(line);
        if (m && !fence) fence = { ch: m[1][0], len: m[1].length, index: m[2].trim() === "sb-index", startLine: i, from: offset, indent: /^\s*/.exec(line)[0] };
        else if (m && fence && m[1][0] === fence.ch && m[1].length >= fence.len && !m[2].trim()) {
          if (fence.index) out.push({
            startLine: fence.startLine,
            endLine: i,
            from: fence.from,
            to: offset + line.length,
            indent: fence.indent,
            source: lines.slice(fence.startLine + 1, i).join("\n")
          });
          fence = null;
        }
        offset += line.length + 1;
      }
      return out;
    }
    function locateIndexBlock(text, startLine, source) {
      const blocks = indexBlocks(text), same = blocks.filter((b) => b.source.trim() === String(source || "").trim());
      return blocks.find((b) => b.startLine === startLine) || (same.length === 1 ? same[0] : null) || (blocks.length === 1 ? blocks[0] : null);
    }
    module2.exports = {
      OPEN_RE,
      CLOSE_RE,
      HEADING_RE,
      LINK_RE,
      marker,
      parseMeta,
      headingText,
      isMarkerLine,
      rowKind,
      linkName,
      safeName,
      scan,
      sectionAt,
      rowAt,
      moveRow,
      toggleArchive,
      linkify,
      sectionText,
      wellFormed,
      releaseSection,
      headingLink,
      linkLabel,
      parseIndex,
      serializeIndex,
      indexEntries,
      addIndexEntry,
      removeIndexEntry,
      moveIndexEntry,
      editIndexEntry,
      indexBlocks,
      locateIndexBlock
    };
  }
});

// plugin.js
var {
  Plugin,
  PluginSettingTab,
  Setting,
  Notice,
  Menu,
  Modal,
  FuzzySuggestModal,
  setIcon,
  getIcon,
  MarkdownRenderChild,
  TFile,
  TFolder,
  editorInfoField,
  editorLivePreviewField,
  normalizePath
} = require("obsidian");
var { EditorState, StateField, StateEffect, Transaction, RangeSet, EditorSelection, Prec } = require("@codemirror/state");
var { EditorView, WidgetType, Decoration } = require("@codemirror/view");
var core = require_core();
var refresh = StateEffect.define();
var EVENT = "input.nsb.section.";
var MEDIA_RE = /^(avif|bmp|gif|jpe?g|png|svg|webp|heic|mp4|m4v|webm|mov|ogv)$/i;
var MEDIA_FOLDER_RE = / (media|images)$/;
var GALLERY_FENCE_RE = /^\s*(`{3,}|~{3,})\s*gallery-view\s*$/;
var FENCE_CLOSE_RE = /^\s*(`{3,}|~{3,})\s*$/;
// A ```gallery-view block (Gallery View plugin) stores its items as JSON; the
// links inside are invisible to metadataCache, so they are read here directly.
function galleryModel(block) {
  const lines = block.split(/\r?\n/);
  if (!GALLERY_FENCE_RE.test(lines[0] || "")) return null;
  const end = lines.length - (FENCE_CLOSE_RE.test(lines[lines.length - 1] || "") ? 1 : 0);
  try {
    const model = JSON.parse(lines.slice(1, end).join("\n"));
    return model && Array.isArray(model.images) ? model : null;
  } catch (_) {
    return null;
  }
}
function linkDestination(markdown) {
  const link = String(markdown || "");
  if (link.startsWith("![[")) return link.slice(3, -2).split("|")[0].trim();
  const m = /\]\((<[^>]*>|[^)\s]+)/.exec(link);
  if (!m) return "";
  const raw = m[1].startsWith("<") ? m[1].slice(1, -1) : m[1];
  try {
    return decodeURIComponent(raw);
  } catch (_) {
    return raw;
  }
}
function galleryLinks(block) {
  const model = galleryModel(block);
  return model ? model.images.map((i) => linkDestination(i && i.link)).filter((d) => d && !/^[a-z][a-z0-9+.-]*:/i.test(d)) : [];
}
function rewriteGalleryBlock(block, from, to) {
  const model = galleryModel(block);
  if (!model) return block;
  let changed = false;
  for (const item of model.images) {
    if (!item || typeof item.link !== "string" || linkDestination(item.link) !== from) continue;
    changed = true;
    if (item.link.startsWith("![[")) {
      const inner = item.link.slice(3, -2), bar = inner.indexOf("|");
      item.link = "![[" + to + (bar >= 0 ? inner.slice(bar) : "") + "]]";
    } else item.link = item.link.replace(/\]\((<[^>]*>|[^)\s]+)/, (m, p) => "](" + (p.startsWith("<") ? "<" + to + ">" : encodeURI(to)));
  }
  if (!changed) return block;
  const lines = block.split("\n"), indent = /^\s*/.exec(lines[0])[0];
  return lines[0] + "\n" + indent + JSON.stringify(model) + "\n" + lines[lines.length - 1];
}
function rewriteGalleryBlocks(text, from, to) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const open = GALLERY_FENCE_RE.exec(lines[i]);
    if (!open) continue;
    let j = i + 1;
    while (j < lines.length && !(FENCE_CLOSE_RE.test(lines[j]) && lines[j].trim()[0] === open[1][0] && lines[j].trim().length >= open[1].length)) j++;
    if (j >= lines.length) break;
    const out = rewriteGalleryBlock(lines.slice(i, j + 1).join("\n"), from, to).split("\n");
    lines.splice(i, j - i + 1, ...out);
    i += out.length - 1;
  }
  return lines.join("\n");
}
var ICONS = {
  section: ["layout-list", "list"],
  link: ["link", "link-2"],
  archive: ["archive", "inbox"],
  restore: ["archive-restore", "undo-2"],
  top: ["arrow-up-to-line", "arrow-up"],
  index: ["table-of-contents", "list"],
  add: ["plus", "plus"],
  edit: ["sliders-horizontal", "settings"]
};
var SVG = "http://www.w3.org/2000/svg";
var icon = (key) => {
  const [want, fallback] = ICONS[key];
  return getIcon(want) ? want : fallback;
};
var make = (doc, tag, cls, parent) => {
  const el = doc.createElement(tag);
  if (cls) el.className = cls;
  if (parent) parent.appendChild(el);
  return el;
};
var stop = (e) => {
  e.preventDefault();
  e.stopPropagation();
};
var button = (doc, parent, cls, key, label, onClick) => {
  const b = make(doc, "button", "sb-btn clickable-icon " + cls, parent);
  b.type = "button";
  b.title = label;
  b.setAttribute("aria-label", label);
  setIcon(b, icon(key));
  b.addEventListener("mousedown", stop);
  b.addEventListener("click", (e) => {
    stop(e);
    onClick();
  });
  return b;
};
var RowButtons = class extends WidgetType {
  constructor(plugin, kind) {
    super();
    this.plugin = plugin;
    this.kind = kind;
    this.lang = paipaEffectiveLang();
  }
  eq(o) {
    return o.plugin === this.plugin && o.kind === this.kind && o.lang === this.lang;
  }
  ignoreEvent() {
    return true;
  }
  toDOM(view) {
    const doc = view.dom.ownerDocument, root = make(doc, "span", "sb-actions");
    root.contentEditable = "false";
    root.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      stop(e);
      view.dispatch({ selection: EditorSelection.cursor(view.posAtDOM(root), 1) });
      view.focus();
    });
    const link = button(doc, root, "sb-link", "link", paipaT("Make link and page"), () => this.plugin.linkRow(view, view.posAtDOM(root)));
    if (this.kind === "link") {
      link.disabled = true;
      link.title = paipaT("Already a link");
      link.setAttribute("aria-disabled", "true");
    }
    button(doc, root, "sb-archive-btn", "archive", paipaT("Archive"), () => this.plugin.moveRow(view, view.posAtDOM(root), true));
    return root;
  }
};
var ArchiveWidget = class extends WidgetType {
  constructor(plugin, section) {
    super();
    this.plugin = plugin;
    this.open = section.open;
    this.openLine = section.openLine;
    this.items = section.items.filter((r) => r.kind !== "blank").map((r) => ({ offset: r.line - section.openLine, kind: r.kind, text: r.text.trim() }));
    this.key = JSON.stringify(this.items);
    this.lang = paipaEffectiveLang();
  }
  eq(o) {
    return o.plugin === this.plugin && o.open === this.open && o.openLine === this.openLine && o.key === this.key && o.lang === this.lang;
  }
  ignoreEvent() {
    return true;
  }
  get estimatedHeight() {
    return 62 + (this.open ? this.items.length * 26 : 0);
  }
  toDOM(view) {
    const doc = view.dom.ownerDocument, plugin = this.plugin;
    const root = make(doc, "div", "sb-archive" + (this.open ? " is-open" : " is-closed") + (this.items.length ? "" : " is-empty"));
    root.contentEditable = "false";
    root.dataset.sbLine = String(this.openLine);
    root.addEventListener("mousedown", stop);
    const head = make(doc, "div", "sb-archive-head", root);
    head.setAttribute("role", "button");
    head.tabIndex = 0;
    head.setAttribute("aria-expanded", String(this.open));
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        stop(e);
        head.click();
      }
    });
    head.title = this.open ? paipaT("Collapse archive") : paipaT("Expand archive");
    const triangle = doc.createElementNS(SVG, "svg"), shape = doc.createElementNS(SVG, "path");
    triangle.setAttribute("viewBox", "0 0 10 10");
    triangle.setAttribute("class", "sb-archive-triangle");
    shape.setAttribute("d", "M2.6 1.3 8.4 5 2.6 8.7Z");
    triangle.appendChild(shape);
    head.appendChild(triangle);
    make(doc, "span", "sb-archive-label", head).textContent = paipaT("Archive");
    if (this.items.length) make(doc, "span", "sb-archive-count", head).textContent = String(this.items.length);
    head.addEventListener("click", (e) => {
      stop(e);
      plugin.toggleArchive(view, view.posAtDOM(root));
    });
    const divider = doc.createElement("div");
    divider.className = "sb-divider";
    divider.setAttribute("aria-hidden", "true");
    if (!this.open) {
      root.appendChild(divider);
      return root;
    }
    const list = make(doc, "ul", "sb-archive-list", root);
    for (const item of this.items) {
      const li = make(doc, "li", "sb-archive-item", list);
      if (item.kind === "text" || item.kind === "link") {
        button(doc, li, "sb-restore", "restore", paipaT("Restore"), () => {
          const line = view.state.doc.lineAt(view.posAtDOM(root)).number - 1 + item.offset;
          plugin.moveRow(view, view.state.doc.line(line + 1).from, false);
        });
      }
      const name = core.linkName(item.text);
      if (name) {
        const a = make(doc, "a", "internal-link sb-archive-link", li);
        const alias = /\|([^\]]*)\]\]$/.exec(item.text);
        a.textContent = alias ? alias[1] : name;
        a.href = "#";
        a.dataset.href = name;
        a.addEventListener("click", (e) => {
          stop(e);
          plugin.openLink(a, name, plugin.pathFor(view), e.ctrlKey || e.metaKey);
        });
      } else make(doc, "span", "sb-archive-text", li).textContent = item.text;
    }
    root.appendChild(divider);
    return root;
  }
};
var TargetSuggest = class extends FuzzySuggestModal {
  constructor(plugin, file, onChoose) {
    super(plugin.app);
    this.plugin = plugin;
    this.file = file;
    this.onChoose = onChoose;
    this.setPlaceholder(paipaT("Link to a section, heading or note\u2026"));
  }
  getItems() {
    const { app } = this.plugin, out = [], cache = app.metadataCache.getFileCache(this.file);
    const sections = new Set(this.plugin.sectionTitles(this.file));
    for (const h of cache?.headings || []) out.push({ label: h.heading, link: core.headingLink(h.heading), hint: sections.has(h.heading) ? paipaT("Section") : paipaT("Heading") });
    for (const f of app.vault.getMarkdownFiles()) {
      if (f.path !== this.file.path) out.push({ label: f.basename, link: app.metadataCache.fileToLinktext(f, this.file.path), hint: f.parent && f.parent.path !== "/" ? f.parent.path : paipaT("Note") });
    }
    return out;
  }
  getItemText(item) {
    return item.label + "  \xB7  " + item.hint;
  }
  onChooseItem(item) {
    this.onChoose({ label: item.label, link: item.link });
  }
};
var RenamePrompt = class extends Modal {
  constructor(app, value, onSubmit) {
    super(app);
    this.value = value;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.titleEl.setText(paipaT("Rename entry"));
    const submit = () => {
      const v = this.value.trim();
      if (v) this.onSubmit(v);
      this.close();
    };
    new Setting(this.contentEl).setName(paipaT("Label")).addText((t) => {
      t.setValue(this.value).onChange((v) => {
        this.value = v;
      });
      t.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.isComposing) {
          e.preventDefault();
          submit();
        }
      });
      setTimeout(() => {
        t.inputEl.focus();
        t.inputEl.select();
      }, 0);
    });
    new Setting(this.contentEl).addButton((b) => b.setButtonText(paipaT("Save")).setCta().onClick(submit)).addButton((b) => b.setButtonText(paipaT("Cancel")).onClick(() => this.close()));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var IndexModal = class extends Modal {
  constructor(plugin, file, model, save) {
    super(plugin.app);
    this.plugin = plugin;
    this.file = file;
    this.save = save;
    this.model = JSON.parse(JSON.stringify(model));
  }
  onOpen() {
    this.titleEl.setText(paipaT("Index"));
    this.modalEl.addClass("sb-index-modal");
    this.draw();
  }
  onClose() {
    this.contentEl.empty();
  }
  draw() {
    const el = this.contentEl, m = this.model;
    el.empty();
    new Setting(el).setName(paipaT("Title")).setDesc(paipaT("Optional caption in front of the entries.")).addText((t) => t.setPlaceholder(paipaT("none")).setValue(m.title).onChange((v) => {
      m.title = v.trim();
    }));
    new Setting(el).setName(paipaT("List sections automatically")).setDesc(paipaT("Every section of this note is listed in document order and follows renames and moves.")).addToggle((t) => t.setValue(m.auto).onChange((v) => {
      m.auto = v;
      this.draw();
    }));
    if (m.auto && m.hidden.length) {
      new Setting(el).setName(paipaT("Hidden sections")).setDesc(m.hidden.map((h) => h.slice(1)).join(", ")).addButton((b) => b.setButtonText(paipaT("Show all")).onClick(() => {
        m.hidden = [];
        this.draw();
      }));
    }
    new Setting(el).setName(paipaT("Entries")).setDesc(m.items.length ? paipaT("Links you added. They follow the sections.") : paipaT("No entries of your own yet.")).setHeading();
    m.items.forEach((item, at) => {
      const row = new Setting(el).setClass("sb-index-row");
      row.addText((t) => t.setPlaceholder(paipaT("Label")).setValue(item.label).onChange((v) => {
        item.label = v.trim() || core.linkLabel(item.link);
      }));
      row.addButton((b) => b.setButtonText(item.link).setTooltip(paipaT("Change target")).onClick(() => new TargetSuggest(this.plugin, this.file, (picked) => {
        item.link = picked.link;
        this.draw();
      }).open()));
      row.addExtraButton((b) => b.setIcon("arrow-up").setTooltip(paipaT("Move up")).setDisabled(at === 0).onClick(() => {
        this.model = core.moveIndexEntry(m, at, -1);
        this.draw();
      }));
      row.addExtraButton((b) => b.setIcon("arrow-down").setTooltip(paipaT("Move down")).setDisabled(at === m.items.length - 1).onClick(() => {
        this.model = core.moveIndexEntry(m, at, 1);
        this.draw();
      }));
      row.addExtraButton((b) => b.setIcon("trash-2").setTooltip(paipaT("Remove")).onClick(() => {
        m.items.splice(at, 1);
        this.draw();
      }));
    });
    new Setting(el).addButton((b) => b.setButtonText(paipaT("Add entry")).setIcon("plus").onClick(() => new TargetSuggest(this.plugin, this.file, (picked) => {
      this.model = core.addIndexEntry(m, picked);
      this.draw();
    }).open()));
    new Setting(el).setClass("sb-index-footer").addButton((b) => b.setButtonText(paipaT("Save")).setCta().onClick(() => {
      this.save(this.model);
      this.close();
    })).addButton((b) => b.setButtonText(paipaT("Cancel")).onClick(() => this.close()));
  }
};
var TopButton = class extends WidgetType {
  constructor(plugin) {
    super();
    this.plugin = plugin;
    this.lang = paipaEffectiveLang();
  }
  eq(o) {
    return o.plugin === this.plugin && o.lang === this.lang;
  }
  ignoreEvent() {
    return true;
  }
  toDOM(view) {
    const b = make(view.dom.ownerDocument, "button", "sb-top clickable-icon");
    b.type = "button";
    b.contentEditable = "false";
    b.title = paipaT("Back to top");
    b.setAttribute("aria-label", paipaT("Back to top"));
    setIcon(b, icon("top"));
    b.addEventListener("mousedown", stop);
    b.addEventListener("click", (e) => {
      stop(e);
      const el = view.scrollDOM, start = el.scrollTop;
      el.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        if (el.scrollTop >= start - 1) el.scrollTop = 0;
      }, 250);
    });
    return b;
  }
};
var SectionBlocks = class extends Plugin {
  async onload() {
    const saved = await this.loadData() || {};
    this.settings = Object.assign({ mediaEnabled: saved.imagesEnabled !== false, pagesRoot: "", language: "auto" }, saved);
    paipaLang = this.settings.language || "auto";
    this.busy = /* @__PURE__ */ new Set();
    this.contextHit = null;
    this.core = core;
    this.noteText = /* @__PURE__ */ new Map();
    const plugin = this;
    this.field = StateField.define({
      create: (state) => plugin.decorations(state),
      update(value, tr) {
        return tr.docChanged || tr.effects.some((e) => e.is(refresh)) || tr.startState.field(editorLivePreviewField, false) !== tr.state.field(editorLivePreviewField, false) ? plugin.decorations(tr.state) : value;
      },
      provide: (field) => [EditorView.decorations.from(field, (v) => v.deco), EditorView.atomicRanges.of((view) => view.state.field(field).atomic)]
    });
    this.registerEditorExtension([Prec.highest(this.field), Prec.high(EditorState.transactionFilter.of((tr) => this.guard(tr)))]);
    this.addSettingTab(new SectionSettings(this.app, this));
    this.registerMarkdownPostProcessor((el, ctx) => {
      const info = ctx.getSectionInfo(el);
      if (!info || el.querySelector(":scope > hr.sb-divider-hr")) return;
      const lines = info.text.split(/\r?\n/).slice(info.lineStart, info.lineEnd + 1);
      if (lines.some((l) => core.CLOSE_RE.test(l))) el.createEl("hr", { cls: "sb-divider-hr" });
    });
    this.registerMarkdownCodeBlockProcessor("sb-index", (source, el, ctx) => this.renderIndex(source, el, ctx));
    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor) => {
      if (!editor?.cm) return;
      const hit = this.contextHit, doc = editor.cm.state.doc;
      const pointer = hit && hit.cm === editor.cm && hit.doc === doc && Date.now() - hit.at < 1e3;
      const line = pointer ? hit.line : editor.getCursor().line;
      menu.addItem((i) => i.setTitle(paipaT("Section")).setIcon(icon("section")).setSection("editor-enhancer").onClick(() => {
        if (editor.cm.state.doc === doc) this.createSection(editor.cm, line);
      }));
      menu.addItem((i) => i.setTitle(paipaT("Index")).setIcon(icon("index")).setSection("editor-enhancer").onClick(() => {
        if (editor.cm.state.doc === doc) this.insertIndexHere(editor.cm, line);
      }));
    }));
    this.registerDomEvent(document, "contextmenu", (e) => {
      const cmEl = e.target?.closest?.(".cm-editor");
      if (!cmEl) return;
      const cm = EditorView.findFromDOM(cmEl);
      if (!cm) return;
      const pos = cm.posAtCoords({ x: e.clientX, y: e.clientY });
      if (pos != null) this.contextHit = { cm, doc: cm.state.doc, line: cm.state.doc.lineAt(pos).number - 1, at: Date.now() };
    }, true);
    this.addCommand({ id: "create-section", name: paipaT("Create section"), editorCallback: (editor) => this.createSection(editor.cm, editor.getCursor().line) });
    this.addCommand({ id: "insert-index", name: paipaT("Insert index at top"), editorCallback: (editor) => this.insertIndex(editor.cm) });
    this.addCommand({ id: "insert-index-here", name: paipaT("Insert index here"), editorCallback: (editor) => this.insertIndexHere(editor.cm, editor.getCursor().line) });
    this.addCommand({ id: "organize-pages", name: paipaT("Organize section pages of this note"), editorCallback: async (editor, view) => {
      const moved = await this.organizePages(view.file);
      new Notice(moved.length ? paipaT("Moved {count} page(s).", { count: moved.length }) : paipaT("Section pages are already in place."));
    } });
    this.addCommand({ id: "organize-media", name: paipaT("Organize media of this note"), editorCallback: async (editor, view) => {
      const moved = await this.tidyMedia(view.file);
      new Notice(moved.length ? paipaT("Moved {count} media file(s).", { count: moved.length }) : paipaT("Media files are already in place."));
    } });
    this.addCommand({ id: "organize-images", name: paipaT("Organize media of every note"), callback: async () => {
      const moved = await this.organizeMediaAll();
      new Notice(moved.length ? paipaT("Moved {count} item(s).", { count: moved.length }) : paipaT("Media files are already in place."));
    } });
    this.registerEvent(this.app.metadataCache.on("changed", (file, data, cache) => {
      if (this.settings.mediaEnabled && file.extension === "md") this.tidyMedia(file, cache).catch((e) => console.error("Section Blocks:", e));
    }));
    this.installAttachmentHook();
    this.registerEvent(this.app.workspace.on("nsb:engine-ready", () => this.refreshEditors()));
    this.app.workspace.onLayoutReady(() => this.refreshEditors());
  }
  engine() {
    return this.app.__nsbToggleEngine || this.app.plugins.plugins["editor-enhancer"] || this.app.plugins.plugins["expiring-blocks"]?.engine;
  }
  pathFor(cm) {
    return cm?.state.field(editorInfoField, false)?.file?.path || "";
  }
  refreshEditors() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const cm = leaf.view?.editor?.cm;
      if (cm?.state.field(this.field, false)) cm.dispatch({ effects: refresh.of(null) });
    });
  }
  decorations(state) {
    const empty = { deco: Decoration.none, atomic: RangeSet.empty, sections: [], sound: true };
    if (state.field(editorLivePreviewField, false) === false) return empty;
    const doc = state.doc, text = doc.toString(), sections = core.scan(text);
    if (!sections.length) return Object.assign({}, empty, { sound: core.wellFormed(text) });
    const toggles = this.engine()?.toggleApi?.scan(doc) || [];
    const hidden = (n) => toggles.some((t) => !t.open && n >= t.bodyStartLine && n <= t.endLine);
    const inToggle = (n) => toggles.some((t) => n >= t.startLine && n <= t.endLine);
    const decos = [], atoms = [];
    for (const s of sections) {
      if (s.titleLine >= 0 && !hidden(s.titleLine)) {
        decos.push(Decoration.line({ attributes: { class: "sb-title-line" } }).range(s.titleFrom));
        decos.push(Decoration.widget({ widget: new TopButton(this), side: 1 }).range(s.titleTo));
      }
      for (const r of s.rows) {
        if (inToggle(r.line) || r.kind !== "text" && r.kind !== "link") continue;
        decos.push(Decoration.line({ attributes: { class: "sb-row" } }).range(r.from));
        decos.push(Decoration.widget({ widget: new RowButtons(this, r.kind), side: -1 }).range(r.from));
      }
      if (hidden(s.openLine)) continue;
      const block = Decoration.replace({ widget: new ArchiveWidget(this, s), block: true });
      decos.push(block.range(s.openFrom, s.closeTo));
      atoms.push(block.range(s.openFrom, s.closeTo));
    }
    return { deco: Decoration.set(decos, true), atomic: RangeSet.of(atoms, true), sections, sound: core.wellFormed(text) };
  }
  // Edits may not split, merge or orphan an archive marker; whole sections may go.
  guard(tr) {
    if (!tr.docChanged) return tr;
    const event = tr.annotation(Transaction.userEvent) || "";
    if (/^(undo|redo)(\.|$)/.test(event)) return tr;
    const value = tr.startState.field(this.field, false);
    if (!value || !value.sound) return tr;
    let touched = value.sections.length > 0;
    if (!touched) tr.changes.iterChanges((a, b, c, d, ins) => {
      if (ins.toString().includes("sb-archive")) touched = true;
    });
    if (!touched) return tr;
    return core.wellFormed(tr.newDoc.toString()) ? tr : [];
  }
  lineAt(view, pos) {
    return view.state.doc.lineAt(pos).number - 1;
  }
  moveRow(view, pos, toArchive) {
    const changes = core.moveRow(view.state.doc.toString(), this.lineAt(view, pos), toArchive);
    if (!changes) return false;
    view.dispatch({ changes, userEvent: EVENT + (toArchive ? "archive" : "restore") });
    return true;
  }
  toggleArchive(view, pos) {
    const change = core.toggleArchive(view.state.doc.toString(), this.lineAt(view, pos));
    if (!change) return false;
    view.dispatch({ changes: change, userEvent: EVENT + "toggle" });
    return true;
  }
  async linkRow(view, pos) {
    const text = view.state.doc.toString(), line = this.lineAt(view, pos);
    const result = core.linkify(text, line);
    if (!result) return false;
    const section = core.sectionAt(core.scan(text), line), sourcePath = this.pathFor(view);
    view.dispatch({ changes: result.change, userEvent: EVENT + "link" });
    if (!this.app.metadataCache.getFirstLinkpathDest(result.name, sourcePath)) {
      const folder = this.sectionFolder(section.title);
      await this.ensureFolder(folder);
      await this.app.vault.create(folder + "/" + result.name + ".md", "");
    }
    return true;
  }
  sectionFolder(title) {
    const root = normalizePath(this.settings.pagesRoot || "").replace(/^\/+|\/+$/g, "");
    const name = core.safeName(title) || "Section";
    return root ? root + "/" + name : name;
  }
  // Tolerates a concurrent creator (the attachment hook and a tidy pass can race
  // for the same media folder): on failure wait for the folder to appear.
  async ensureFolder(path) {
    let at = "";
    for (const part of path.split("/")) {
      at = at ? at + "/" + part : part;
      if (this.app.vault.getAbstractFileByPath(at)) continue;
      try {
        await this.app.vault.createFolder(at);
      } catch (e) {
        for (let i = 0; i < 20 && !this.app.vault.getAbstractFileByPath(at); i++) await new Promise((r) => setTimeout(r, 50));
        if (!this.app.vault.getAbstractFileByPath(at)) throw e;
      }
    }
  }
  // A new block takes over a blank row; otherwise it lands below the row (or the
  // toggle / section that owns it) with a blank line between.
  blockSlot(cm, line, afterOnly) {
    const doc = cm.state.doc;
    line = Math.max(0, Math.min(line, doc.lines - 1));
    const owner = core.sectionAt(core.scan(doc.toString()), line);
    const toggle = (this.engine()?.toggleApi?.scan(doc) || []).find((t) => line >= t.startLine && line <= t.endLine);
    const row = doc.line(line + 1);
    if (!afterOnly && !owner && !toggle && row.text.trim() === "") return { from: row.from, to: row.to, prefix: "" };
    const at = doc.line((owner ? owner.closeLine : toggle ? toggle.endLine : line) + 1).to;
    return { from: at, to: at, prefix: "\n\n" };
  }
  createSection(cm, line, afterOnly = false) {
    if (!cm) return false;
    const { from, to, prefix } = this.blockSlot(cm, line, afterOnly), start = from + prefix.length + 2;
    cm.dispatch({ changes: { from, to, insert: prefix + core.sectionText("Section") }, selection: { anchor: start, head: start + "Section".length }, userEvent: EVENT + "create" });
    cm.focus();
    return true;
  }
  insertIndexHere(cm, line) {
    if (!cm) return false;
    const { from, to, prefix } = this.blockSlot(cm, line, false);
    cm.dispatch({ changes: { from, to, insert: prefix + core.serializeIndex(core.parseIndex("")) }, userEvent: EVENT + "index" });
    return true;
  }
  insertIndex(cm) {
    if (!cm) return false;
    const doc = cm.state.doc;
    let at = 0;
    if (doc.lines > 2 && doc.line(1).text === "---") {
      for (let n = 2; n <= doc.lines; n++) if (doc.line(n).text === "---") {
        at = doc.line(n).to + (n < doc.lines ? 1 : 0);
        break;
      }
    }
    cm.dispatch({ changes: { from: at, insert: (at > 0 && doc.sliceString(at - 1, at) !== "\n" ? "\n" : "") + "```sb-index\n```\n\n" }, userEvent: EVENT + "index" });
    return true;
  }
  // An index renders its entries as links plus two quiet tools (add, edit). Every
  // change is written back into the block's JSON in one edit.
  renderIndex(source, el, ctx) {
    const child = new MarkdownRenderChild(el), doc = el.ownerDocument, model = core.parseIndex(source);
    const file = () => {
      const f = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
      return f instanceof TFile ? f : null;
    };
    const save = (next) => this.saveIndex(file(), ctx.getSectionInfo(el)?.lineStart, source, next);
    const tool = (parent, key, label, action) => {
      const b = make(doc, "button", "sb-index-tool clickable-icon", parent);
      b.type = "button";
      b.title = label;
      b.setAttribute("aria-label", label);
      setIcon(b, icon(key));
      b.addEventListener("click", (e) => {
        stop(e);
        action();
      });
    };
    const render = async () => {
      const f = file();
      if (!f) return;
      const text = await this.app.vault.cachedRead(f);
      this.noteText.set(f.path, text);
      el.empty();
      const nav = make(doc, "nav", "sb-index", el);
      nav.setAttribute("aria-label", model?.title || paipaT("Index"));
      if (!model) {
        make(doc, "span", "sb-index-empty", nav).textContent = paipaT("This index could not be read.");
        const reset = make(doc, "button", "sb-index-reset", nav);
        reset.type = "button";
        reset.textContent = paipaT("Reset");
        reset.addEventListener("click", (e) => {
          stop(e);
          save(core.parseIndex(""));
        });
        return;
      }
      const entries = core.indexEntries(model, this.sectionTitles(f));
      nav.sbIndex = { model, entries, save };
      if (model.title) make(doc, "span", "sb-index-title", nav).textContent = model.title;
      for (const entry of entries) {
        const a = make(doc, "a", "internal-link sb-index-link" + (this.indexTargetExists(entry.link, f) ? "" : " is-unresolved"), nav);
        a.textContent = entry.label;
        a.href = "#";
        a.dataset.href = entry.link;
        a.addEventListener("click", (e) => {
          stop(e);
          this.openLink(a, entry.link, ctx.sourcePath, e.ctrlKey || e.metaKey);
        });
        a.addEventListener("contextmenu", (e) => {
          stop(e);
          this.entryMenu(e, f, model, entry, save);
        });
      }
      if (!entries.length) make(doc, "span", "sb-index-empty", nav).textContent = paipaT("Empty index");
      const tools = make(doc, "span", "sb-index-tools", nav);
      tool(tools, "add", paipaT("Add entry"), () => new TargetSuggest(this, f, (picked) => save(core.addIndexEntry(model, picked))).open());
      tool(tools, "edit", paipaT("Edit index"), () => new IndexModal(this, f, model, save).open());
    };
    el.addEventListener("contextmenu", (e) => {
      const f = file();
      if (!model || !f || e.target.closest("a")) return;
      stop(e);
      const menu = new Menu();
      menu.addItem((i) => i.setTitle(paipaT("Add entry\u2026")).setIcon(icon("add")).onClick(() => new TargetSuggest(this, f, (picked) => save(core.addIndexEntry(model, picked))).open()));
      menu.addItem((i) => i.setTitle(paipaT("Edit index\u2026")).setIcon(icon("edit")).onClick(() => new IndexModal(this, f, model, save).open()));
      menu.showAtMouseEvent(e);
    });
    child.registerEvent(this.app.metadataCache.on("changed", (f) => {
      if (f.path === ctx.sourcePath) render();
    }));
    ctx.addChild(child);
    render();
  }
  // Links open from the pane they sit in, whichever pane had focus before the click.
  openLink(el, link, sourcePath, newTab) {
    let owner = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view?.containerEl?.contains(el)) owner = leaf;
    });
    if (owner && !newTab) this.app.workspace.setActiveLeaf(owner, { focus: true });
    return this.app.workspace.openLinkText(link, sourcePath, newTab);
  }
  sectionTitles(file) {
    return core.scan(this.noteText.get(file.path) || "").map((s) => s.title).filter(Boolean);
  }
  indexTargetExists(link, file) {
    if (!link.startsWith("#")) return !!this.app.metadataCache.getFirstLinkpathDest(link.split("#")[0], file.path);
    const headings = (this.app.metadataCache.getFileCache(file)?.headings || []).map((h) => h.heading).concat(this.sectionTitles(file));
    return headings.some((h) => core.headingLink(h) === link);
  }
  entryMenu(event, file, model, entry, save) {
    const menu = new Menu(), last = model.items.length - 1;
    menu.addItem((i) => i.setTitle(paipaT("Open in new tab")).setIcon("file-plus").onClick(() => this.app.workspace.openLinkText(entry.link, file.path, true)));
    if (!entry.auto) {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle(paipaT("Rename\u2026")).setIcon("pencil").onClick(() => new RenamePrompt(this.app, entry.label, (label) => save(core.editIndexEntry(model, entry.at, { label }))).open()));
      menu.addItem((i) => i.setTitle(paipaT("Change target\u2026")).setIcon(icon("link")).onClick(() => new TargetSuggest(this, file, (picked) => save(core.editIndexEntry(model, entry.at, { link: picked.link }))).open()));
      menu.addItem((i) => i.setTitle(paipaT("Move left")).setIcon("arrow-left").setDisabled(entry.at === 0).onClick(() => save(core.moveIndexEntry(model, entry.at, -1))));
      menu.addItem((i) => i.setTitle(paipaT("Move right")).setIcon("arrow-right").setDisabled(entry.at === last).onClick(() => save(core.moveIndexEntry(model, entry.at, 1))));
    }
    menu.addSeparator();
    menu.addItem((i) => i.setTitle(paipaT("Remove")).setIcon("trash-2").onClick(() => save(core.removeIndexEntry(model, entry))));
    menu.showAtMouseEvent(event);
  }
  // Open source-mode editors take the edit as one undoable transaction; otherwise
  // (reading view, closed note) the file itself is rewritten.
  async saveIndex(file, startLine, source, model) {
    if (!file) return false;
    let done = false;
    this.app.workspace.iterateAllLeaves((leaf) => {
      const v = leaf.view;
      if (done || v?.getViewType?.() !== "markdown" || v.file?.path !== file.path || v.getMode?.() !== "source" || !v.editor?.cm) return;
      const cm = v.editor.cm, block = core.locateIndexBlock(cm.state.doc.toString(), startLine, source);
      if (!block) return;
      cm.dispatch({ changes: { from: block.from, to: block.to, insert: core.serializeIndex(model, block.indent) }, userEvent: EVENT + "index" });
      done = true;
    });
    if (!done) await this.app.vault.process(file, (text) => {
      const block = core.locateIndexBlock(text, startLine, source);
      if (!block) return text;
      done = true;
      return text.slice(0, block.from) + core.serializeIndex(model, block.indent) + text.slice(block.to);
    });
    if (!done) new Notice(paipaT("Could not find this index block in the note."));
    return done;
  }
  // ---- Media folders -------------------------------------------------------
  // Every image / video a note shows lives in "<note> media" beside the note
  // ("<note> images" is the pre-1.2 name and still counts as the note's own).
  mediaFolder(file) {
    const dir = file.parent && file.parent.path !== "/" ? file.parent.path + "/" : "";
    return dir + file.basename + " media";
  }
  legacyMediaFolder(file) {
    return this.mediaFolder(file).replace(/ media$/, " images");
  }
  imageFolder(file) {
    return this.mediaFolder(file);
  }
  isMedia(file) {
    return file instanceof TFile && MEDIA_RE.test(file.extension);
  }
  // Duck interface for other plugins (Gallery View asks before creating a dropped
  // file): the path a new attachment `name` of note `sourcePath` should be
  // created at, inside the note's media folder (created on demand). null when
  // the feature is off or the attachment is not media for a note.
  async mediaPathFor(name, sourcePath) {
    if (!this.settings.mediaEnabled) return null;
    const note = this.app.vault.getAbstractFileByPath(String(sourcePath || ""));
    if (!(note instanceof TFile) || note.extension !== "md") return null;
    const match = /^(.*[^.])\.([^./\\]+)$/.exec(String(name || "").trim());
    if (!match || !MEDIA_RE.test(match[2])) return null;
    const folder = this.mediaFolder(note);
    await this.ensureFolder(folder);
    return this.app.vault.getAvailablePath(folder + "/" + match[1], match[2]);
  }
  // Obsidian's own paste / drop handlers go through app.saveAttachment ->
  // vault.getAvailablePathForAttachments(name, ext, file); the public
  // fileManager.getAvailablePathForAttachment(name, sourcePath) is what other
  // plugins call. Both get the same answer, so a file dropped into the note body
  // lands in the media folder directly. Restored on unload.
  installAttachmentHook() {
    this.hook(this.app.vault, "getAvailablePathForAttachments", (name, ext, file) => this.mediaPathFor(name + "." + ext, file?.path));
    this.hook(this.app.fileManager, "getAvailablePathForAttachment", (name, sourcePath) => this.mediaPathFor(name, sourcePath));
  }
  hook(target, key, resolve) {
    const original = target?.[key];
    if (typeof original !== "function") return;
    const own = Object.prototype.hasOwnProperty.call(target, key);
    const hooked = async function(...args) {
      try {
        const path = await resolve(...args);
        if (path) return path;
      } catch (e) {
        console.error("Section Blocks:", e);
      }
      return original.apply(this, args);
    };
    target[key] = hooked;
    this.register(() => {
      if (target[key] !== hooked) return;
      if (own) target[key] = original;
      else delete target[key];
    });
  }
  // Media links of a note: metadata embeds plus the links stored inside
  // ```gallery-view blocks.
  async mediaLinks(file, cache) {
    const links = (cache?.embeds || []).map((e) => e.link || "");
    const codes = (cache?.sections || []).filter((s) => s.type === "code");
    if (codes.length) {
      const text = await this.app.vault.cachedRead(file);
      for (const s of codes) links.push(...galleryLinks(text.slice(s.position.start.offset, s.position.end.offset)));
    }
    return links.map((l) => l.split("#")[0].trim()).filter(Boolean);
  }
  // Move the media a note shows into its media folder. Obsidian rewrites the
  // embeds; a path-style link inside a gallery block is rewritten here.
  async tidyMedia(file, cache = file instanceof TFile ? this.app.metadataCache.getFileCache(file) : null, dryRun = false) {
    const moved = [];
    if (!(file instanceof TFile) || file.extension !== "md") return moved;
    const folder = this.mediaFolder(file), legacy = this.legacyMediaFolder(file), seen = /* @__PURE__ */ new Set();
    for (const link of await this.mediaLinks(file, cache)) {
      const target = this.app.metadataCache.getFirstLinkpathDest(link, file.path);
      if (!this.isMedia(target) || seen.has(target.path)) continue;
      const from = target.path, parent = target.parent?.path || "/";
      seen.add(from);
      if (parent === folder || parent === legacy || MEDIA_FOLDER_RE.test(target.parent?.name || "")) continue;
      const dest = folder + "/" + target.name;
      if (this.busy.has(from) || this.app.vault.getAbstractFileByPath(dest)) continue;
      if (dryRun) {
        moved.push(from + " \u2192 " + dest);
        continue;
      }
      this.busy.add(from);
      try {
        await this.ensureFolder(folder);
        await this.app.fileManager.renameFile(target, dest);
        if (link.includes("/")) await this.app.vault.process(file, (text) => rewriteGalleryBlocks(text, link, dest));
        moved.push(from + " \u2192 " + dest);
      } finally {
        this.busy.delete(from);
      }
    }
    return moved;
  }
  // Whole-vault pass: rename pre-1.2 "<note> images" folders that sit beside
  // their note to "<note> media", then tidy every note.
  async organizeMediaAll(dryRun = false) {
    const moved = [];
    for (const folder of this.app.vault.getAllLoadedFiles()) {
      if (!(folder instanceof TFolder) || !/ images$/.test(folder.name)) continue;
      const dir = folder.parent && folder.parent.path !== "/" ? folder.parent.path + "/" : "", base = folder.name.slice(0, -7);
      const note = this.app.vault.getAbstractFileByPath(dir + base + ".md"), dest = dir + base + " media", from = folder.path;
      if (!(note instanceof TFile) || this.app.vault.getAbstractFileByPath(dest)) continue;
      if (!dryRun) await this.app.fileManager.renameFile(folder, dest);
      moved.push(from + "/ \u2192 " + dest + "/");
    }
    for (const file of this.app.vault.getMarkdownFiles()) moved.push(...await this.tidyMedia(file, void 0, dryRun));
    return moved;
  }
  async organizeImagesAll(dryRun = false) {
    return this.organizeMediaAll(dryRun);
  }
  // Every page a section links to lives in <pages root>/<Section title>/. A page
  // that sits in a folder of its own name moves together with that folder.
  async organizePages(file, dryRun = false) {
    if (!(file instanceof TFile)) return [];
    const sections = core.scan(await this.app.vault.cachedRead(file)), moved = [];
    for (const s of sections) {
      if (!s.title) continue;
      const folder = this.sectionFolder(s.title);
      for (const r of [...s.rows, ...s.items]) {
        if (r.kind !== "link") continue;
        const target = this.app.metadataCache.getFirstLinkpathDest(core.linkName(r.text), file.path);
        if (!(target instanceof TFile) || target.extension !== "md" || target.path === file.path) continue;
        const parent = target.parent;
        const subject = parent && parent.path !== "/" && parent.name === target.basename ? parent : target;
        const dest = folder + "/" + subject.name;
        if (subject.path === dest || dest.startsWith(subject.path + "/") || this.app.vault.getAbstractFileByPath(dest)) continue;
        if (dryRun) {
          moved.push(subject.path + " \u2192 " + dest);
          continue;
        }
        await this.ensureFolder(folder);
        await this.app.fileManager.renameFile(subject, dest);
        moved.push(subject.path + " \u2192 " + dest);
      }
    }
    return moved;
  }
  // NSB integration. Units: the title row and the archive block are slot anchors
  // (rows between them stay ordinary NSB blocks). Targets: the title row's handle
  // carries the whole section; the closing divider offers only the plus button.
  titleEl(cm, s) {
    try {
      const d = cm.domAtPos(s.titleFrom);
      return (d.node.nodeType === 1 ? d.node : d.node.parentElement)?.closest(".cm-line") || null;
    } catch (_) {
      return null;
    }
  }
  nsbTargetAt(cm, x, y, pad) {
    const value = cm?.state.field(this.field, false);
    if (!value) return null;
    const over = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && x >= r.left - pad && x <= r.right && y >= r.top && y <= r.bottom;
    };
    for (const s of value.sections) {
      const divider = cm.contentDOM.querySelector('.sb-archive[data-sb-line="' + s.openLine + '"] .sb-divider');
      if (over(divider)) return { kind: "section-divider", el: divider, startLine: s.closeLine, endLine: s.closeLine, noHandle: true };
      const title = s.titleLine >= 0 ? this.titleEl(cm, s) : null;
      if (over(title)) return { kind: "section", el: title, startLine: s.titleLine, endLine: s.closeLine };
    }
    return null;
  }
  // A dragged block that carries a section may not land inside another section.
  nsbAllowDrop(cm, startLine, endLine, insertLine) {
    const sections = cm?.state.field(this.field, false)?.sections || [];
    const carried = (s) => s.startLine >= startLine && s.closeLine <= endLine;
    if (!sections.some(carried)) return true;
    return !sections.some((s) => !carried(s) && insertLine > s.startLine && insertLine <= s.closeLine);
  }
  // Handle menu › Delete on a section dissolves it: heading and markers go, rows stay.
  releaseTarget(cm, target) {
    if (!cm || !target || target.kind !== "section") return false;
    const changes = core.releaseSection(cm.state.doc.toString(), target.startLine);
    if (!changes) return false;
    cm.dispatch({ changes, userEvent: EVENT + "release" });
    return true;
  }
  nsbUnits(cm) {
    const value = cm?.state.field(this.field, false);
    if (!value) return [];
    const units = [];
    for (const s of value.sections) {
      const title = s.titleLine >= 0 ? this.titleEl(cm, s) : null;
      if (title) units.push({ el: title, kind: "section-title", startLine: s.titleLine, endLine: s.titleLine });
      const el = cm.contentDOM.querySelector('.sb-archive[data-sb-line="' + s.openLine + '"]');
      if (el) units.push({ el, kind: "section-archive", startLine: s.openLine, endLine: s.closeLine });
    }
    return units;
  }
  addBlockMenu(menu, editor, target) {
    if (!editor?.cm || !target || typeof target.endLine !== "number") return;
    const snapshot = editor.cm.state.doc;
    menu.addItem((i) => i.setTitle(paipaT("Section")).setIcon(icon("section")).onClick(() => {
      if (editor.cm.state.doc === snapshot) this.createSection(editor.cm, target.endLine, true);
    }));
  }
  async saveSettings() {
    paipaLang = this.settings.language || "auto";
    await this.saveData(this.settings);
  }
};
var SectionSettings = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl: el } = this;
    el.empty();
    new Setting(el).setName(paipaT("Language")).setDesc(paipaT("Follow Obsidian's language, or choose one for this plugin.")).addDropdown((d) => d.addOption("auto", paipaT("Follow Obsidian")).addOption("en", "English").addOption("zh", "中文").setValue(this.plugin.settings.language || "auto").onChange(async (v) => {
      this.plugin.settings.language = v;
      await this.plugin.saveSettings();
      this.display();
      this.plugin.refreshEditors();
    }));
    new Setting(el).setName(paipaT("Pages root")).setDesc(paipaT("Section pages are created in <root>/<Section title>/. Leave empty for the vault root.")).addText((t) => t.setPlaceholder(paipaT("vault root")).setValue(this.plugin.settings.pagesRoot).onChange(async (v) => {
      this.plugin.settings.pagesRoot = v.trim();
      await this.plugin.saveSettings();
    }));
    new Setting(el).setName(paipaT("Organize media")).setDesc(paipaT(`Keep every image / video a note shows in a "<note name> media" folder beside the note: files dropped or pasted into the note (or into one of its galleries) are created there, and media the note embeds from elsewhere is moved there. Files already in another note's media folder stay put.`)).addToggle((t) => t.setValue(this.plugin.settings.mediaEnabled).onChange(async (v) => {
      this.plugin.settings.mediaEnabled = v;
      await this.plugin.saveSettings();
    }));
  }
};
module.exports = SectionBlocks;
module.exports.core = core;
