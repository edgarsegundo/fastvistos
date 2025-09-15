
/**
 * Removes all <!-- ... --> comments from Astro file content.
 * @param {string} content - The raw Astro file content as a string.
 * @returns {string} The content with all HTML comments removed.
 */
export function stripAstroComments(content) {
  return content.replace(/<!--([\s\S]*?)-->/g, '');
}
