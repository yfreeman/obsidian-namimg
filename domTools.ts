const findChildHeading = (node: HTMLElement): string | null => {
	let headingText = null;
	if (!node.querySelectorAll) return headingText;
	const list: NodeList = node.querySelectorAll('[data-heading]');
	if (list.length > 0) {
		headingText = ((list[list.length - 1] as HTMLElement).attributes as any)['data-heading'].value;
	}
	return headingText;
}

/**
 * Recursively goes up sibling element looking for a heading attribute
 * 
 * @param node r
 * @returns 
 */
const findSiblingHeading = (node: HTMLElement): string | null => {
	let headingText = null;

	if (node.previousSibling) {
		headingText = findChildHeading(node.previousSibling as HTMLElement);
		if (!headingText) {
			headingText = findSiblingHeading(node.previousSibling as HTMLElement);
		}
	}

	return headingText
}

/**
 * Recursively looks at sibling element and then works up the DOM tree (to parent) looking for an element with data-heading attribute	
 * @param node 
 * @returns 
 */
export const getClosetHeading = (node: HTMLElement): string | null => {
    let heading = null;
	if (!node) return null;
	// First look at siblins
	if (node.previousSibling) {
		heading = findSiblingHeading(node);
	}
	if (heading === null) {
		heading = getClosetHeading(node.parentNode as HTMLElement);
	}
	// then look at parents.
	return heading;
}
