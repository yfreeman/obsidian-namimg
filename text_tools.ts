import { CachedMetadata, EditorPosition, EditorRange, SectionCache } from "obsidian";

const getSectionByType = (sections: SectionCache[], type: string) => {
    const arrayOfType = sections.filter((section) => section.type === type);
    return arrayOfType;
}

export const textGetYamlRange = (cacheMetadata: CachedMetadata): EditorRange => {
    const ymlsectionArry = getSectionByType(cacheMetadata.sections, 'yaml');
    if (ymlsectionArry.length === 1) {
        const ymlSection = ymlsectionArry[0];

        const ymlRange: EditorRange = {
            from: {
               line:  ymlSection.position.start.line + 1,
               ch: ymlSection.position.start.col,
            } as EditorPosition,
            to: {
                line: ymlSection.position.end.line - 1,
                ch: ymlSection.position.end.col,
            } as EditorPosition,
        }
        return ymlRange;
    }

    return null;
};