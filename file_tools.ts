import { App, stringifyYaml, TFile, FileManager, Vault, TFolder, parseFrontMatterEntry } from "obsidian";

export const stringContainsId = (name: string, id: string) => {
    name.startsWith(id);
}

export const getIdFromFilename = (filename: string): string => {
    return filename.split('--')[0].trim();
}

export const getTitleFromFilename = (filename: string): string => {
    return filename.split('--')[1].trim();
}

export const getFileByFilePath = (app: App, filepath: string): TFile | null => {
	const files = app.vault.getMarkdownFiles();
	const file = files.find((file) => file.path === filepath);
	return file;
}

export const getParentFile = (file: TFile, app: App): TFile => {
    let fmc = app.metadataCache.getFileCache(file)?.frontmatter;
    const parentId = fmc.Parent;
    const allFiles = app.vault.getMarkdownFiles();
    const matchingFiles: TFile[] = allFiles.filter((file) => file.name.startsWith(parentId));
    const fileWithIdArr = matchingFiles.filter((file) => getIdFromFilename(file.name) === parentId);
    if (fileWithIdArr.length) {
        return fileWithIdArr[0];
    }
}

export const getSiblings = (file: TFile, app: App): TFile[] => {
    let fmc = app.metadataCache.getFileCache(file)?.frontmatter;
    const parentId = fmc.Parent;
    return getChildren(parentId, app);;
}

export const doesChildExistByID = (id: string, file: TFile, app: App): TFile | null => {
	const parentID = getIdFromFilename(file.name);
    const siblings = getChildren(parentID, app);
	const lastSi = indexOfList(siblings, id);
	if (lastSi !== null) return siblings[lastSi];
	return null;
}

export const doesSiblingExistByID = (id: string, file: TFile, app: App): boolean => {
    const siblings = getSiblings(file, app);
	const lastSi = indexOfList(siblings, id);
	if (lastSi !== null) return true;
	return false;
}

export const getParentId = (id: string) => {
    const idArray = id.split('.');
    return idArray.splice(0, idArray.length - 1).join(".");
}

// Given a string will return the next ascii character. starting form 0-9 and then a-z.
// Once it reaches "z" we start the next one. "z1, z2, ...."
export const nextAsciiValue = (current: string): string => {
    const stringArray = current.split('');
    const nextValue = current.charCodeAt(stringArray.length -1) + 1;
    // if it's a number ok.
    if ((nextValue > 47 && nextValue < 58) || (nextValue > 96 && nextValue < 123)) stringArray[stringArray.length -1] = String.fromCharCode(nextValue);
    // if it's greater that 9 and become a ":", change to "a";
    if (nextValue === 58) stringArray[stringArray.length -1] = String.fromCharCode(97);
    // if it's greater that "z", start the next character at "1"
    if (nextValue > 122) stringArray[stringArray.length] = String.fromCharCode(48);
    return stringArray.join('');
};

export const prevAsciiValue = (current: string): string => {
    const stringArray = current.split('');
    let prevValue = current.charCodeAt(stringArray.length -1) - 1;
    if (prevValue === 48) {
        stringArray.pop();
        return stringArray.join('');
    }
    if (prevValue === 96) {
        prevValue = 57;
    }
    stringArray[stringArray.length -1] = String.fromCharCode(prevValue);
    return stringArray.join('');
};

// Given a string will return the next ascii character. starting form 0-9 and then a-z.
// Once it reaches "z" we start the next one. "z1, z2, ...."
export const asciiValueBetween = (first: string | null, second: string): string => {
    if (first === null) {
        const secondStringArray = second.split('');
        if (secondStringArray.length === 1 && second.charCodeAt(0) === 97) {
            return String.fromCharCode(57, 57, 57, 57);
        } else if(secondStringArray.length === 1 && second.charCodeAt(0) > 97 && second.charCodeAt(0) < 123) {
            return String.fromCharCode(second.charCodeAt(0) - 1); 
        }
        if (secondStringArray.length > 1) {
            // TODO: finish this off some other time
        }
    }
    const firstStringArray = first.split('');
    const secondStringArray = second.split('');
    if (firstStringArray.length > secondStringArray.length) return nextAsciiValue(first);
    // start a new level of characters
    firstStringArray[firstStringArray.length] = String.fromCharCode(110);

    if (firstStringArray.join('') === secondStringArray.join('') || firstStringArray.join('') > secondStringArray.join('')) {
        let prevValue = prevAsciiValue(second);
        const prevtSringArray = prevValue.split('');
        if (prevValue === first || prevtSringArray[prevtSringArray.length -1] === "0") {
            prevtSringArray[prevtSringArray.length] = String.fromCharCode(48) + String.fromCharCode(110);
            return prevtSringArray.join('');
        } else {
            return prevValue;
        }
    }
    if (firstStringArray.join('') > secondStringArray.join('')) {

    }

    return firstStringArray.join('');
};

export const getAllDecendants = (parentId: string | string, app: App): TFile[] => {
    const allFiles = app.vault.getMarkdownFiles();
    const childIdsString = `${parentId}.`;
    const decendants: TFile[] = allFiles.filter((file) => file.name.startsWith(childIdsString));
    return decendants;
}

export const getFileById = (id: string, app: App): TFile => {
    const allFiles = app.vault.getMarkdownFiles();
    const fileIdString = `${id}`;
    const matches: TFile[] = allFiles.filter((file) => getIdFromFilename(file.name) === fileIdString);
    if (matches.length) {
        return matches[0];
    }
    return null;
}

export const getChildren = (parentId: string, app: App): TFile[] => {
    const decendents = getAllDecendants(parentId, app);
    const childIdsString = `${parentId}.`;
    const childIdStringArrayLength = childIdsString.split('.').length;
    const children: TFile[] = decendents.filter((file) => getIdFromFilename(file.name).split('.').length === childIdStringArrayLength);
    // children.sort((file1, file2) => getIdFromFilename(file1.name).split('.').slice(-1).pop() );
    children.sort((file1, file2) => {
        const file1Char = getIdFromFilename(file1.name).split('.').slice(-1).pop();
        const file2Char = getIdFromFilename(file2.name).split('.').slice(-1).pop();
        if (file1Char === file2Char) return 0;
        return !(file1Char < file2Char) ? 1 : -1;
    });
    return children;
}

export const createNewFile = (app: App, id: string, name: string) => {
    return new Promise((resolve, reject) => {
        const filename = `${id} -- ${name}.md`;
        const parentId = getParentId(id);
        const frontMatter = {
            ID: id,
            Parent: parentId,
            alias: [id, name],
        }
        const data = `---
${stringifyYaml(frontMatter)}---

# ${name}`;
        app.vault.create(filename, data).then((file: TFile) => {
            app.workspace.openLinkText(file.basename, file.path, true);
            resolve(file.name)
        });
    });
}

export const indexOfList = (fileList: TFile[], id: string): number => {
    let fileIndex = null;
    fileList.some((file, index) => {
        if(getIdFromFilename(file.name) === id) fileIndex = index; 
    });
    return fileIndex;
}

export const createNewQAFile = (app: App, id: string, name: string): Promise<TFile> => {
	return new Promise(async (resolve, reject) => {
		const TFileName = `${id} -- ${name}`
        const filename = `${TFileName}.md`;
        const parentId = getParentId(id);
		const finalPath = `qa/${filename}`;

		const qaFrontmatterFileName = 'frontmatter';
		const qaFrontmatterFillFileName = `${qaFrontmatterFileName}.md`;
		const qaFileFrontmatter: TFile = {
			// vault: {} as Vault,//app.vault,
			path: `qa/${qaFrontmatterFillFileName}`,
			name: qaFrontmatterFillFileName,
			// parent: {} as TFolder,
			// stat: {ctime: 0, mtime: 0, size: 0},
    		basename: qaFrontmatterFileName,
    		extension: 'md',
		} as TFile;
		const { vault } = app;
		const qaFrontMatterFile = getFileByFilePath(app, `qa/${qaFrontmatterFillFileName}`);
		const fc = await vault.cachedRead(qaFrontMatterFile);
		const fmc = app.metadataCache.getFileCache(qaFrontMatterFile)?.frontmatter;
		fmc.Parent = parentId;
		fmc.ID = id;
		// fmc.tags = "qa";
		fmc.alias = [id, name];
		delete fmc.position;

		const data = `---
${stringifyYaml(fmc)}---

# ${name}`;

		app.vault.create(finalPath, data).then((file: TFile) => {
			resolve(file);
		});
	});
}
