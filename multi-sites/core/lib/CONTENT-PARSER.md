# Content Parser System Documentation

## Overview

The Content Parser System is a robust, extensible framework for processing custom tags in markdown content. It's designed to handle multiple tag types with different parsing strategies and can be easily extended with new parsers.

## Architecture

### Core Components

1. **ContentParserService**: Main service class that manages all parsers
2. **TagParser Interface**: Standard interface for all tag parsers
3. **ParseContext Interface**: Context information passed to parsers
4. **ParseResult Interface**: Detailed result information from parsing

### Built-in Parsers

#### 1. HiddenRefParser (`HIDDEN-REF`)
**Purpose**: Conditionally show/hide content based on article publication status

**Syntax**: `[[HIDDEN-REF]]article-uuid[[/HIDDEN-REF]]`

**Behavior**:
- If article with UUID exists and is published → Show the UUID (remove tags)
- If article doesn't exist or is not published → Remove everything
- If UUID is empty → Remove everything

**Examples**:
```markdown
# Article with hidden references

This content is always visible.

[[HIDDEN-REF]]abc123def456[[/HIDDEN-REF]]

More visible content here.

[[HIDDEN-REF]]unpublished-article-uuid[[/HIDDEN-REF]]
```

**Result** (assuming abc123def456 is published, unpublished-article-uuid is not):
```markdown
# Article with hidden references

This content is always visible.

abc123def456

More visible content here.


```

## Usage

### Basic Usage

```typescript
import { contentParser } from './lib/content-parser';

const content = `
# My Article

Some text [[HIDDEN-REF]]article-uuid-123[[/HIDDEN-REF]] more text.
`;

// Parse content
const result = await contentParser.parseContent(content, {
    debug: true,
    context: {
        articleSlug: 'my-article',
        businessId: 'my-business-id'
    }
});

console.log(result.content); // Processed content
console.log(result.stats);   // Processing statistics
```

### Advanced Usage with Custom Parser

```typescript
// Create a custom parser
class CustomTagParser implements TagParser {
    tagName = 'CUSTOM-TAG';
    pattern = /\[\[CUSTOM-TAG\]\](.*?)\[\[\/CUSTOM-TAG\]\]/gis;
    
    async parse(match: RegExpMatchArray): Promise<string> {
        const content = match[1];
        // Your custom logic here
        return content.toUpperCase();
    }
}

// Register the parser
contentParser.registerParser(new CustomTagParser());

// Now use it
const content = 'Text with [[CUSTOM-TAG]]hello world[[/CUSTOM-TAG]] here.';
const result = await contentParser.parseContent(content);
// Result: "Text with HELLO WORLD here."
```

## Extending the System

### Creating New Parsers

1. **Implement the TagParser interface**:

```typescript
export class MyCustomParser implements TagParser {
    tagName = 'MY-TAG';
    
    // Define the regex pattern for your tag
    pattern = /\[\[MY-TAG\]\](.*?)\[\[\/MY-TAG\]\]/gis;
    
    // Main parsing logic
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const content = match[1]?.trim();
        
        // Your processing logic here
        return processedContent;
    }
    
    // Optional: Validation
    validate(content: string): boolean {
        return content.length > 0;
    }
    
    // Optional: Pre-processing
    preProcess(content: string): string {
        return content.replace(/\s+/g, ' ');
    }
    
    // Optional: Post-processing
    postProcess(content: string): string {
        return content.trim();
    }
}
```

2. **Register your parser**:

```typescript
contentParser.registerParser(new MyCustomParser());
```

### Example: Date Parser

```typescript
export class DateParser implements TagParser {
    tagName = 'DATE';
    pattern = /\[\[DATE\]\](.*?)\[\[\/DATE\]\]/gis;
    
    async parse(match: RegExpMatchArray): Promise<string> {
        const format = match[1]?.trim() || 'default';
        const now = new Date();
        
        switch (format) {
            case 'iso':
                return now.toISOString();
            case 'br':
                return now.toLocaleDateString('pt-BR');
            case 'us':
                return now.toLocaleDateString('en-US');
            default:
                return now.toDateString();
        }
    }
    
    validate(content: string): boolean {
        const validFormats = ['iso', 'br', 'us', 'default', ''];
        return validFormats.includes(content.trim());
    }
}
```

Usage:
```markdown
Today is [[DATE]]br[[/DATE]]
ISO format: [[DATE]]iso[[/DATE]]
```

### Example: Include Parser

```typescript
export class IncludeParser implements TagParser {
    tagName = 'INCLUDE';
    pattern = /\[\[INCLUDE\]\](.*?)\[\[\/INCLUDE\]\]/gis;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const filePath = match[1]?.trim();
        
        if (!filePath) return '';
        
        try {
            // Read file content (implement your file reading logic)
            const fileContent = await this.readIncludeFile(filePath);
            return fileContent;
        } catch (error) {
            console.error(`Failed to include file: ${filePath}`, error);
            return `<!-- Failed to include: ${filePath} -->`;
        }
    }
    
    private async readIncludeFile(path: string): Promise<string> {
        // Implement your file reading logic
        // Could be from filesystem, database, API, etc.
        return '';
    }
    
    validate(content: string): boolean {
        return content.trim().length > 0 && !content.includes('..');
    }
}
```

## Configuration Options

### ParseOptions

```typescript
interface ParseOptions {
    debug?: boolean;              // Enable debug logging
    maxIterations?: number;       // Max parsing iterations (default: 10)
    context?: ParseContext;       // Parsing context
    skipValidation?: boolean;     // Skip validation step
    customParsers?: TagParser[];  // Use specific parsers only
}
```

### ParseContext

```typescript
interface ParseContext {
    articleSlug?: string;         // Current article slug
    articleId?: string;           // Current article ID
    businessId?: string;          // Business ID for scoping
    metadata?: Record<string, any>; // Additional metadata
    debug?: boolean;              // Debug mode flag
}
```

## Best Practices

### 1. Parser Design
- Keep parsers focused on a single responsibility
- Use descriptive tag names (e.g., `HIDDEN-REF`, `DATE-FORMAT`)
- Always handle edge cases (empty content, invalid input)
- Provide meaningful error messages

### 2. Performance
- Use efficient regex patterns
- Avoid complex operations in frequently used parsers
- Consider caching for expensive operations
- Set reasonable limits (maxIterations)

### 3. Security
- Always validate input content
- Sanitize any user-provided data
- Be cautious with dynamic content generation
- Use whitelist approaches when possible

### 4. Testing
- Test with various input combinations
- Test edge cases (empty content, malformed tags)
- Test performance with large content
- Test parser interactions

## Error Handling

The system provides comprehensive error handling:

```typescript
const result = await contentParser.parseContent(content);

if (result.stats.errors > 0) {
    console.log('Parsing errors occurred:');
    result.errors?.forEach(error => {
        console.log(`- ${error.tagName}: ${error.error}`);
    });
}
```

## Debugging

Enable debug mode for detailed logging:

```typescript
const result = await contentParser.parseContent(content, {
    debug: true
});

// Check debug information
result.debug?.forEach(step => {
    console.log(`${step.step}: ${step.tagName} - ${step.action}`);
});
```

## Integration with Astro

The system integrates seamlessly with Astro blog posts:

```astro
---
// In your blog post template
import { contentParser } from '../../lib/content-parser.ts';

const rawContent = entry.body || '';
const parseResult = await contentParser.parseContent(rawContent, {
    context: {
        articleSlug: entry.slug,
        articleId: articleFromDb?.id,
    }
});
---

<div class="blog-content">
    {parseResult.content && (
        <ParsedMarkdown content={parseResult.content} />
    )}
</div>
```

## Future Extensions

The system is designed for easy extension. Consider these potential parsers:

1. **Feature Flags**: `[[IF-FEATURE]]feature-name[[CONTENT]]content[[/IF-FEATURE]]`
2. **A/B Testing**: `[[AB-TEST]]test-name[[VERSION-A]]content-a[[VERSION-B]]content-b[[/AB-TEST]]`
3. **User Roles**: `[[IF-ROLE]]admin[[CONTENT]]admin-only content[[/IF-ROLE]]`
4. **Dynamic Content**: `[[DYNAMIC]]recent-articles:5[[/DYNAMIC]]`
5. **Localization**: `[[I18N]]pt-br:Olá|en:Hello|es:Hola[[/I18N]]`
6. **Media Embeds**: `[[EMBED]]youtube:video-id[[/EMBED]]`
7. **Code Snippets**: `[[CODE]]language:javascript[[CONTENT]]console.log('hello')[[/CODE]]`

The modular architecture makes adding these features straightforward while maintaining backward compatibility.
