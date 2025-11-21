---
title: Contributing Guide
description: How to contribute to CRAI
---

Thank you for considering contributing to CRAI! This guide will help you get started.

## Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/CRAI.git
   cd CRAI
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Set up development environment**
   ```bash
   # Backend
   cd ai
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

## Development Workflow

### 1. Make Changes

```bash
# Make your changes
# Add tests
# Update documentation
```

### 2. Run Tests

```bash
# Backend tests
cd ai
pytest

# Frontend tests
cd frontend
npm test
```

### 3. Format Code

```bash
# Backend (Black)
cd ai
black api/

# Frontend (Prettier)
cd frontend
npm run format
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(api): add plate recognition endpoint
fix(frontend): resolve button alignment issue
docs(readme): update installation instructions
test(backend): add tests for router
```

## Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters (Black default)
- Use docstrings for functions and classes

```python
from typing import Optional

def process_image(
    image_path: str, 
    confidence: Optional[float] = 0.75
) -> dict:
    """
    Process image and detect license plates.
    
    Args:
        image_path: Path to the image file
        confidence: Minimum confidence threshold (0.0-1.0)
        
    Returns:
        dict: Detection results with plates and coordinates
    """
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Prefer functional components
- Use meaningful variable names
- Add JSDoc comments for complex functions

```typescript
interface PlateResult {
  plate: string
  confidence: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Detect license plates in the provided image
 */
export async function detectPlates(
  image: File
): Promise<PlateResult[]> {
  // Implementation
}
```

## Testing Requirements

### Backend

- All new functions must have tests
- Maintain 80%+ code coverage
- Test edge cases and error conditions

```python
def test_process_image_invalid_path():
    """Test error handling for invalid image path"""
    with pytest.raises(FileNotFoundError):
        process_image("/invalid/path.jpg")
```

### Frontend

- Test components in isolation
- Mock API calls
- Test user interactions

```typescript
it('should display error when upload fails', async () => {
  const { getByText } = render(<UploadForm />)
  // Test implementation
})
```

## Documentation

- Update README.md if adding features
- Add docstrings/JSDoc comments
- Update API documentation
- Add examples for new features

## Pull Request Process

1. **Update documentation**
2. **Add/update tests**
3. **Ensure all tests pass**
4. **Format code**
5. **Create descriptive PR**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Code Review

Your PR will be reviewed for:
- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation
- ✅ Performance considerations
- ✅ Security concerns

## Development Setup

### Backend Development

```bash
cd ai

# Install dev dependencies
pip install -r requirements.txt
pip install black pytest pytest-cov

# Run development server
uvicorn api.main:app --reload

# Run tests
pytest --cov=api
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Format code
npm run format
```

## Reporting Issues

When reporting bugs, include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node version)
- Screenshots if applicable

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Python: [e.g., 3.11]
- Node: [e.g., 20.x]
```

## Questions?

- Check [Documentation](/)
- Review [Code Style Guide](/guides/code-style/)
- Ask in GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the project's license.
