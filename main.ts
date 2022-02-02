import { asciiValueBetween, createNewFile, getAllDecendants, getChildren, getFileById, getIdFromFilename, getParentFile, getSiblings, indexOfList, nextAsciiValue } from 'file_tools';
import { App, Editor, EditorRange, MarkdownView, Modal, Notice, parseFrontMatterEntry, parseFrontMatterTags, parseYaml, Plugin, PluginSettingTab, Setting, MarkdownRenderer, PluginManifest, MarkdownPostProcessorContext } from 'obsidian';
import { textGetYamlRange } from 'text_tools';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class ZettleNaming extends Plugin {
	settings: MyPluginSettings;
	app: App;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.app = app;
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Hello There again!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'ztlnaming-create-sibling',
			name: 'ZNaming - Create Sibling File',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection().trim();
				const file = this.app.workspace.getActiveFile();
				let fmc = this.app.metadataCache.getFileCache(file)?.frontmatter;
				const parentId = fmc.Parent;
				const currentId = fmc.ID;

				const siblings = getSiblings(file, this.app);
				const siblingIndex = indexOfList(siblings, currentId);
				let siblingId = '';

				if (siblingIndex === (siblings.length - 1)) {
					// it's the last one
					siblingId = nextAsciiValue(currentId);
				} else {
					siblingId = asciiValueBetween(currentId, getIdFromFilename(siblings[siblingIndex + 1].name));
				}

				if (selection === "") {
					new FileNameModal(this.app, (result) => {
						if (result === undefined) return;
						createNewFile(this.app, siblingId, result).then((filename: string) => {
							// no need to replace text. nothing selected.
						});
					}).open();
				} else {
					createNewFile(this.app, siblingId, selection).then((filename: string) => {
						const replacedText = `[[${filename}|${selection}]]`;
						editor.replaceSelection(replacedText);
					});
				}
			}
		});
		this.addCommand({
			id: 'ztlnaming-create-last-sibling',
			name: 'ZNaming - Create Last Sibling',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection().trim();
				const file = this.app.workspace.getActiveFile();
				let fmc = this.app.metadataCache.getFileCache(file)?.frontmatter;
				const parentId = fmc.Parent;
				const currentId = fmc.ID;

				const siblings = getSiblings(file, this.app);
				const lastSi = indexOfList(siblings, currentId);
				const lastSiblingId = getIdFromFilename(siblings[siblings.length - 1].name)
				let siblingId = nextAsciiValue(lastSiblingId);

				if (selection === "") {
					new FileNameModal(this.app, (result) => {
						if (result === undefined) return;
						createNewFile(this.app, siblingId, result).then((filename: string) => {
							// no need to replace text. nothing selected.
						});
					}).open();
				} else {
					createNewFile(this.app, siblingId, selection).then((filename: string) => {
						const replacedText = `[[${filename}|${selection}]]`;
						editor.replaceSelection(replacedText);
					});
				}
			}
		});
		this.addCommand({
			id: 'ztlnaming-create-last-child',
			name: 'ZNaming - Create Last Child',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection().trim();
				const file = this.app.workspace.getActiveFile();
				let fmc = this.app.metadataCache.getFileCache(file)?.frontmatter;
				let id = '';
				if (fmc === undefined) {
					id = getIdFromFilename(file.basename);
				} else {
					id = fmc.ID;
				}
				// const parentFile = getParentFile(file, this.app);
				const childrenFiles = getChildren(id, this.app);
				let childId = '';
				if (childrenFiles.length) {
					// get last child
					const lastChild = childrenFiles[childrenFiles.length - 1];
					const lastChildFrontmatter = this.app.metadataCache.getFileCache(lastChild)?.frontmatter;
					childId = nextAsciiValue(lastChildFrontmatter.ID);
				} else {
					childId = `${fmc.ID}.a`;
				}

				if (selection === "") {
					new FileNameModal(this.app, (result) => {
						if (result === undefined) return;
						createNewFile(this.app, childId, result).then((filename: string) => {
							// no need to replace text. nothing selected.
						});
					}).open();
				} else {
					createNewFile(this.app, childId, selection).then((filename: string) => {
						const replacedText = `[[${filename}|${selection}]]`;
						editor.replaceSelection(replacedText);
					});
				}
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.registerMarkdownPostProcessor(((app: App) => {
			return (element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const a = 1;
				if(element.querySelectorAll("div pre.frontmatter").length) {
					const file = getFileById(context.frontmatter.Parent, app);
					if (!file) return;
					// const markdown = await MarkdownRenderer.renderMarkdown('[[D.153.1.notetaking.a.b -- This is a sibling|This is a sibling]]', element, '', null);
					const div = element.createDiv()
					div.createEl('p', {text: 'Parent: '}).createEl('a', {
						text: file.basename,
						attr: {
							'data-href': file.basename,
							href: file.basename,
							class: "internal-link",
							target: "_blank",
							rel: "noopener"
						}
					});
					const decendants = getChildren(context.frontmatter.ID, app);
					if (decendants.length) {
						const firstChild = decendants[0];
						div.createEl('p', {text: 'First Child: '}).createEl('a', {
							text: firstChild.basename,
							attr: {
								'data-href': firstChild.basename,
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
							div.createEl('p', {text: 'Previous Sibling: '}).createEl('a', {
								text: prevSibling.basename,
								attr: {
									'data-href': prevSibling.basename,
									href: prevSibling.basename,
									class: "internal-link",
									target: "_blank",
									rel: "noopener"
								}
							});
						}
						if (!(siblingIndex > (siblings.length - 1))) {
							const nextSibling = siblings[siblingIndex + 1];
							div.createEl('p', {text: 'Next Sibling: '}).createEl('a', {
								text: nextSibling.basename,
								attr: {
									'data-href': nextSibling.basename,
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
		})(this.app));;
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}


class FileNameModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", { text: "Enter header" });

		new Setting(contentEl)
			.setName("Header")
			.addText((text) =>
				text.onChange((value) => {
				this.result = value
			}));

		new Setting(contentEl)
			.addButton((btn) =>
				btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.result);
			}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ZettleNaming;

	constructor(app: App, plugin: ZettleNaming) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
