# Contributing to Cucumber Reportr

Thank you for your interest in contributing to Cucumber Reportr! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:
- Check if the issue already exists in [GitHub Issues](https://github.com/nil-malh/cucumber-reportr/issues)
- Use the issue templates when available
- Provide detailed information including:
  - Version of Cucumber Reportr
  - Java version
  - Steps to reproduce
  - Expected vs actual behavior
  - Sample Cucumber JSON if relevant

### Suggesting Features

Feature requests are welcome! Please:
- Check [GitHub Discussions](https://github.com/nil-malh/cucumber-reportr/discussions) for existing suggestions
- Provide a clear description of the feature and its benefits
- Consider the scope and impact on existing functionality

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure the build passes** with `mvn clean verify`
6. **Create a pull request** with a clear description

#### Pull Request Process

- Keep changes focused and atomic
- Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Update the CHANGELOG.md for significant changes
- Ensure all CI checks pass
- Request review from maintainers

## 🛠️ Development Setup

### Prerequisites

- **Java 17+** (OpenJDK recommended)
- **Maven 3.6+**
- **Node.js 18+** and npm
- **Git**

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cucumber-reportr.git
cd cucumber-cucumber-reportr

# Build the project
mvn clean package

# For frontend development
cd front
npm install
npm run dev
```

### Running Tests

```bash
# Run all tests
mvn test

# Run with coverage
mvn clean verify

# Skip frontend build during development
mvn clean package -Pdev
```

### Code Style

#### Java
- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Add Javadoc for public APIs
- Keep methods focused and concise

#### JavaScript/React
- Use ESLint configuration provided
- Follow React best practices
- Use TypeScript-style JSDoc comments
- Prefer functional components with hooks

#### General
- Use consistent indentation (4 spaces for Java, 2 for JS/CSS)
- Remove trailing whitespace
- End files with a newline

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Examples:
```
feat(frontend): add dark theme toggle
fix(parser): handle malformed JSON gracefully
docs: update installation instructions
```

## 🏗️ Project Structure

```
cucumber-reportr/
├── src/main/java/           # Java source code
│   └── io/nil-malh/...      # Main packages
├── front/                   # React frontend
│   ├── src/                 # React components
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Build configuration
├── .github/                 # GitHub workflows
├── pom.xml                  # Maven configuration
└── README.md                # Project documentation
```

### Key Components

- **Core.java**: Main report generation logic
- **CucumberReportInjector.java**: Cucumber plugin integration
- **frontend/src/**: React components for the report UI
- **GitHub Actions**: CI/CD workflows for testing and releasing

## 🧪 Testing

### Java Tests
- Unit tests for core functionality
- Integration tests for end-to-end scenarios
- Use JUnit 5 and meaningful test names

### Frontend Tests
- Component tests for React components
- Integration tests for user workflows
- Visual regression tests for UI changes

### Test Data
- Use realistic Cucumber JSON samples
- Include edge cases and error conditions
- Anonymize any sensitive data

## 📚 Documentation

### Code Documentation
- Add Javadoc for public APIs
- Include usage examples
- Document complex algorithms

### User Documentation
- Update README.md for new features
- Add examples to demonstrate usage
- Keep documentation in sync with code

## 🚀 Release Process

Releases are automated through GitHub Actions:

1. **Version Bump**: Update version in `pom.xml`
2. **Create Tag**: `git tag v1.x.x && git push origin v1.x.x`
3. **GitHub Actions**: Automatically builds and publishes to Maven Central
4. **GitHub Release**: Created with changelog and artifacts

### Version Strategy

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 👥 Community

### Communication
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code discussions

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please be respectful and inclusive.

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Documentation improvements
- Test coverage expansion

### New Features
- Additional chart types and visualizations
- Export functionality (PDF, etc.)
- Custom theming options
- Integration with other testing frameworks

### Frontend Improvements
- Accessibility enhancements
- Mobile responsiveness
- User experience improvements
- Performance optimizations

## 📝 Questions?

If you have questions about contributing:
- Check the [Wiki](https://github.com/nil-malh/cucumber-reportr/wiki)
- Open a [Discussion](https://github.com/nil-malh/cucumber-reportr/discussions)
- Review existing [Issues](https://github.com/nil-malh/cucumber-reportr/issues)

Thank you for contributing to Cucumber Reportr! 🎉
