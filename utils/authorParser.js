function parseAuthorNames(authorString) {
  if (!authorString) return [];

  // Split by semicolon and trim each part
  const parts = authorString.split(';').map(part => part.trim());

  // Process each part to handle "Y" cases
  const authors = parts.reduce((acc, part) => {
    // Split by "Y" and trim each part
    const subParts = part.split(/\s+Y\s+/i).map(subPart => subPart.trim());
    
    // Add all parts to the accumulator
    return [...acc, ...subParts];
  }, []);

  // Filter out empty strings and return unique authors
  return [...new Set(authors.filter(author => author.length > 0))];
}

module.exports = {
  parseAuthorNames
}; 