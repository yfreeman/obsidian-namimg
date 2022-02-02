/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
__export(exports, {
  default: () => ZettleNaming
});

// file_tools.ts
var import_obsidian = __toModule(require("obsidian"));
var getIdFromFilename = (filename) => {
  return filename.split("--")[0].trim();
};
var getSiblings = (file, app) => {
  var _a;
  let fmc = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
  const parentId = fmc.Parent;
  return getChildren(parentId, app);
  ;
};
var getParentId = (id) => {
  const idArray = id.split(".");
  return idArray.splice(0, idArray.length - 1).join(".");
};
var nextAsciiValue = (current) => {
  const stringArray = current.split("");
  const nextValue = current.charCodeAt(stringArray.length - 1) + 1;
  if (nextValue > 47 && nextValue < 58 || nextValue > 96 && nextValue < 123)
    stringArray[stringArray.length - 1] = String.fromCharCode(nextValue);
  if (nextValue === 58)
    stringArray[stringArray.length - 1] = String.fromCharCode(97);
  if (nextValue > 122)
    stringArray[stringArray.length] = String.fromCharCode(48);
  return stringArray.join("");
};
var prevAsciiValue = (current) => {
  const stringArray = current.split("");
  let prevValue = current.charCodeAt(stringArray.length - 1) - 1;
  if (prevValue === 48) {
    stringArray.pop();
    return stringArray.join("");
  }
  if (prevValue === 96) {
    prevValue = 57;
  }
  stringArray[stringArray.length - 1] = String.fromCharCode(prevValue);
  return stringArray.join("");
};
var asciiValueBetween = (first, second) => {
  if (first === null) {
    const secondStringArray2 = second.split("");
    if (secondStringArray2.length === 1 && second.charCodeAt(0) === 97) {
      return String.fromCharCode(57, 57, 57, 57);
    } else if (secondStringArray2.length === 1 && second.charCodeAt(0) > 97 && second.charCodeAt(0) < 123) {
      return String.fromCharCode(second.charCodeAt(0) - 1);
    }
    if (secondStringArray2.length > 1) {
    }
  }
  const firstStringArray = first.split("");
  const secondStringArray = second.split("");
  if (firstStringArray.length > secondStringArray.length)
    return nextAsciiValue(first);
  firstStringArray[firstStringArray.length] = String.fromCharCode(110);
  if (firstStringArray.join("") === secondStringArray.join("") || firstStringArray.join("") > secondStringArray.join("")) {
    let prevValue = prevAsciiValue(second);
    const prevtSringArray = prevValue.split("");
    if (prevValue === first || prevtSringArray[prevtSringArray.length - 1] === "0") {
      prevtSringArray[prevtSringArray.length] = String.fromCharCode(48) + String.fromCharCode(110);
      return prevtSringArray.join("");
    } else {
      return prevValue;
    }
  }
  if (firstStringArray.join("") > secondStringArray.join("")) {
  }
  return firstStringArray.join("");
};
var getAllDecendants = (parentId, app) => {
  const allFiles = app.vault.getMarkdownFiles();
  const childIdsString = `${parentId}.`;
  const decendants = allFiles.filter((file) => file.name.startsWith(childIdsString));
  return decendants;
};
var getFileById = (id, app) => {
  const allFiles = app.vault.getMarkdownFiles();
  const fileIdString = `${id}`;
  const matches = allFiles.filter((file) => getIdFromFilename(file.name) === fileIdString);
  if (matches.length) {
    return matches[0];
  }
  return null;
};
var getChildren = (parentId, app) => {
  const decendents = getAllDecendants(parentId, app);
  const childIdsString = `${parentId}.`;
  const childIdStringArrayLength = childIdsString.split(".").length;
  const children = decendents.filter((file) => getIdFromFilename(file.name).split(".").length === childIdStringArrayLength);
  children.sort((file1, file2) => {
    const file1Char = getIdFromFilename(file1.name).split(".").slice(-1).pop();
    const file2Char = getIdFromFilename(file2.name).split(".").slice(-1).pop();
    if (file1Char === file2Char)
      return 0;
    return !(file1Char < file2Char) ? 1 : -1;
  });
  return children;
};
var createNewFile = (app, id, name) => {
  return new Promise((resolve, reject) => {
    const filename = `${id} -- ${name}.md`;
    const parentId = getParentId(id);
    const frontMatter = {
      ID: id,
      Parent: parentId,
      alias: [id, name]
    };
    const data = `---
${(0, import_obsidian.stringifyYaml)(frontMatter)}---

# ${name}`;
    app.vault.create(filename, data).then((file) => {
      app.workspace.openLinkText(file.basename, file.path, true);
      resolve(file.name);
    });
  });
};
var indexOfList = (fileList, id) => {
  let fileIndex = null;
  fileList.some((file, index) => {
    if (getIdFromFilename(file.name) === id)
      fileIndex = index;
  });
  return fileIndex;
};

// main.ts
var import_obsidian2 = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  mySetting: "default"
};
var ZettleNaming = class extends import_obsidian2.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.app = app;
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      const ribbonIconEl = this.addRibbonIcon("dice", "Sample Plugin", (evt) => {
        new import_obsidian2.Notice("Hello There again!");
      });
      ribbonIconEl.addClass("my-plugin-ribbon-class");
      const statusBarItemEl = this.addStatusBarItem();
      statusBarItemEl.setText("Status Bar Text");
      this.addCommand({
        id: "open-sample-modal-simple",
        name: "Open sample modal (simple)",
        callback: () => {
          new SampleModal(this.app).open();
        }
      });
      this.addCommand({
        id: "ztlnaming-create-sibling",
        name: "ZNaming - Create Sibling File",
        editorCallback: (editor, view) => {
          var _a;
          const selection = editor.getSelection().trim();
          const file = this.app.workspace.getActiveFile();
          let fmc = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
          const parentId = fmc.Parent;
          const currentId = fmc.ID;
          const siblings = getSiblings(file, this.app);
          const siblingIndex = indexOfList(siblings, currentId);
          let siblingId = "";
          if (siblingIndex === siblings.length - 1) {
            siblingId = nextAsciiValue(currentId);
          } else {
            siblingId = asciiValueBetween(currentId, getIdFromFilename(siblings[siblingIndex + 1].name));
          }
          if (selection === "") {
            new FileNameModal(this.app, (result) => {
              if (result === void 0)
                return;
              createNewFile(this.app, siblingId, result).then((filename) => {
              });
            }).open();
          } else {
            createNewFile(this.app, siblingId, selection).then((filename) => {
              const replacedText = `[[${filename}|${selection}]]`;
              editor.replaceSelection(replacedText);
            });
          }
        }
      });
      this.addCommand({
        id: "ztlnaming-create-last-sibling",
        name: "ZNaming - Create Last Sibling",
        editorCallback: (editor, view) => {
          var _a;
          const selection = editor.getSelection().trim();
          const file = this.app.workspace.getActiveFile();
          let fmc = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
          const parentId = fmc.Parent;
          const currentId = fmc.ID;
          const siblings = getSiblings(file, this.app);
          const lastSi = indexOfList(siblings, currentId);
          const lastSiblingId = getIdFromFilename(siblings[siblings.length - 1].name);
          let siblingId = nextAsciiValue(lastSiblingId);
          if (selection === "") {
            new FileNameModal(this.app, (result) => {
              if (result === void 0)
                return;
              createNewFile(this.app, siblingId, result).then((filename) => {
              });
            }).open();
          } else {
            createNewFile(this.app, siblingId, selection).then((filename) => {
              const replacedText = `[[${filename}|${selection}]]`;
              editor.replaceSelection(replacedText);
            });
          }
        }
      });
      this.addCommand({
        id: "ztlnaming-create-last-child",
        name: "ZNaming - Create Last Child",
        editorCallback: (editor, view) => {
          var _a, _b;
          const selection = editor.getSelection().trim();
          const file = this.app.workspace.getActiveFile();
          let fmc = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
          let id = "";
          if (fmc === void 0) {
            id = getIdFromFilename(file.basename);
          } else {
            id = fmc.ID;
          }
          const childrenFiles = getChildren(id, this.app);
          let childId = "";
          if (childrenFiles.length) {
            const lastChild = childrenFiles[childrenFiles.length - 1];
            const lastChildFrontmatter = (_b = this.app.metadataCache.getFileCache(lastChild)) == null ? void 0 : _b.frontmatter;
            childId = nextAsciiValue(lastChildFrontmatter.ID);
          } else {
            childId = `${fmc.ID}.a`;
          }
          if (selection === "") {
            new FileNameModal(this.app, (result) => {
              if (result === void 0)
                return;
              createNewFile(this.app, childId, result).then((filename) => {
              });
            }).open();
          } else {
            createNewFile(this.app, childId, selection).then((filename) => {
              const replacedText = `[[${filename}|${selection}]]`;
              editor.replaceSelection(replacedText);
            });
          }
        }
      });
      this.addCommand({
        id: "open-sample-modal-complex",
        name: "Open sample modal (complex)",
        checkCallback: (checking) => {
          const markdownView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
          if (markdownView) {
            if (!checking) {
              new SampleModal(this.app).open();
            }
            return true;
          }
        }
      });
      this.addSettingTab(new SampleSettingTab(this.app, this));
      this.registerDomEvent(document, "click", (evt) => {
        console.log("click", evt);
      });
      this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
      this.registerMarkdownPostProcessor(((app) => {
        return (element, context) => {
          const a = 1;
          if (element.querySelectorAll("div pre.frontmatter").length) {
            const file = getFileById(context.frontmatter.Parent, app);
            if (!file)
              return;
            const div = element.createDiv();
            div.createEl("p", { text: "Parent: " }).createEl("a", {
              text: file.basename,
              attr: {
                "data-href": file.basename,
                href: file.basename,
                class: "internal-link",
                target: "_blank",
                rel: "noopener"
              }
            });
            const decendants = getChildren(context.frontmatter.ID, app);
            if (decendants.length) {
              const firstChild = decendants[0];
              div.createEl("p", { text: "First Child: " }).createEl("a", {
                text: firstChild.basename,
                attr: {
                  "data-href": firstChild.basename,
                  href: firstChild.basename,
                  class: "internal-link",
                  target: "_blank",
                  rel: "noopener"
                }
              });
            }
            const siblings = getChildren(context.frontmatter.Parent, app);
            if (siblings.length) {
              const siblingIndex = indexOfList(siblings, context.frontmatter.ID);
              if (siblingIndex > 0) {
                const prevSibling = siblings[siblingIndex - 1];
                div.createEl("p", { text: "Previous Sibling: " }).createEl("a", {
                  text: prevSibling.basename,
                  attr: {
                    "data-href": prevSibling.basename,
                    href: prevSibling.basename,
                    class: "internal-link",
                    target: "_blank",
                    rel: "noopener"
                  }
                });
              }
              if (!(siblingIndex > siblings.length - 1)) {
                const nextSibling = siblings[siblingIndex + 1];
                div.createEl("p", { text: "Next Sibling: " }).createEl("a", {
                  text: nextSibling.basename,
                  attr: {
                    "data-href": nextSibling.basename,
                    href: nextSibling.basename,
                    class: "internal-link",
                    target: "_blank",
                    rel: "noopener"
                  }
                });
              }
            }
          }
        };
      })(this.app));
      ;
    });
  }
  onunload() {
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
var SampleModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.setText("Woah!");
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var FileNameModal = class extends import_obsidian2.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h1", { text: "Enter header" });
    new import_obsidian2.Setting(contentEl).setName("Header").addText((text) => text.onChange((value) => {
      this.result = value;
    }));
    new import_obsidian2.Setting(contentEl).addButton((btn) => btn.setButtonText("Submit").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.result);
    }));
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var SampleSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for my awesome plugin." });
    new import_obsidian2.Setting(containerEl).setName("Setting #1").setDesc("It's a secret").addText((text) => text.setPlaceholder("Enter your secret").setValue(this.plugin.settings.mySetting).onChange((value) => __async(this, null, function* () {
      console.log("Secret: " + value);
      this.plugin.settings.mySetting = value;
      yield this.plugin.saveSettings();
    })));
  }
};
