# BlogService Testing

This directory contains comprehensive tests for the `blog-service.ts` file.

## Files

- `blog-service.test.js` - Unit tests for all BlogService methods
- `prisma.js` - Mock Prisma client for testing

## Test Coverage

The test suite covers all public methods of the BlogService class:

### Core Methods Tested

- ✅ `getBlogConfig()` - Fetching blog configuration
- ✅ `getPublishedArticles()` - Retrieving published articles with topics
- ✅ `getArticleBySlug(slug)` - Finding articles by slug
- ✅ `getTopics()` - Getting all blog topics
- ✅ `getRecentArticles(limit)` - Fetching recent articles with optional limit
- ✅ `getTopicsWithArticles()` - Getting topics with their associated articles

### Test Scenarios

Each method is tested for:

- ✅ **Success cases** - Normal operation with valid data
- ✅ **Edge cases** - Empty results, null values
- ✅ **Error handling** - Database connection failures
- ✅ **Parameter validation** - Correct query parameters passed to Prisma

## Running Tests

### Unit Tests (Recommended)

```bash
# Run all BlogService unit tests
npm run test:blog

# Run all tests
npm test
```

### Integration Tests (Requires Database)

```bash
# Run with real database connection
npm run test:blog:integration
```

## Test Structure

### Mocking Strategy

- **Mock Prisma Client**: Tests use a mock Prisma client to avoid database dependencies
- **Function Validation**: Tests verify that correct parameters are passed to Prisma methods
- **Error Simulation**: Tests simulate database errors to ensure proper error handling

### Test Organization

```
BlogService
├── getBlogConfig
│   ├── should return blog config when found
│   ├── should return null when no config found
│   └── should handle database errors gracefully
├── getPublishedArticles
│   ├── should return published articles ordered by date
│   └── should return empty array on database error
├── getArticleBySlug
│   ├── should return article when found by slug
│   └── should return null when article not found
├── getTopics
│   ├── should return all topics ordered by order field
│   └── should return empty array on database error
├── getRecentArticles
│   ├── should return limited number of recent articles
│   └── should use default limit of 5 when no limit specified
└── getTopicsWithArticles
    ├── should return topics with their associated articles
    └── should return empty array on database error
```

## Test Features

### Assertions

- **Data Validation**: Verifies returned data structure and content
- **Query Validation**: Ensures correct Prisma query parameters
- **Error Handling**: Confirms graceful error handling
- **Type Safety**: Validates expected data types

### Mock Configuration

- **Dynamic Mocking**: Each test configures mock responses independently
- **Reset Between Tests**: Mocks are reset before each test case
- **Realistic Data**: Mock data mirrors real database structure

## Example Test Case

```javascript
it('should return published articles ordered by date', async () => {
    const mockArticles = [
        {
            id: 1,
            title: 'Latest Article',
            slug: 'latest-article',
            published: new Date('2024-01-02'),
            is_removed: false,
            blog_topic: { id: 1, name: 'Topic 1', slug: 'topic-1' },
        },
    ];

    mockPrisma.blogArticle.findMany = (options) => {
        // Verify query parameters
        assert.strictEqual(options.where.is_removed, false);
        assert.ok(options.where.published.lte instanceof Date);
        return Promise.resolve(mockArticles);
    };

    const result = await BlogService.getPublishedArticles();
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].title, 'Latest Article');
});
```

## Development Workflow

1. **Write Test First**: Add test cases for new functionality
2. **Run Tests**: Verify current functionality works
3. **Implement Feature**: Add new functionality to `blog-service.ts`
4. **Update Tests**: Ensure tests cover new functionality
5. **Verify**: Run tests to confirm everything works

## Testing Best Practices

- ✅ Test both success and failure scenarios
- ✅ Mock external dependencies (database)
- ✅ Verify query parameters sent to database
- ✅ Test edge cases (empty results, null values)
- ✅ Keep tests isolated and independent
- ✅ Use descriptive test names
- ✅ Assert on specific values, not just existence

## Continuous Integration

These tests are designed to run in CI/CD environments without requiring database setup, making them ideal for:

- Pull request validation
- Continuous integration pipelines
- Local development testing
- Regression testing
