# ZurImpact Frontend

A modern React application built with TypeScript, Vite, and ESLint for the ZurImpact project.

## Prerequisites

- **Node.js**: v24
- **Yarn**: v2.0 or later (corepack)

## Installation

### 1. Enable Yarn via Corepack

Node v24 includes Corepack, which manages Yarn for you. Enable it:

```bash
corepack enable
```

### 2. Install Dependencies

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
yarn install
```

## Development

### Start Development Server

Run the development server with hot module replacement (HMR):

```bash
yarn dev
```

### Build for Production

Create an optimized production build:

```bash
yarn build
```

The compiled files will be in the `dist/` directory.

## Code Quality

### Linting

Check for code quality issues:

```bash
yarn lint
```

### Formatting

Format code with Prettier:

```bash
yarn prettify
```

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   └── components/           # React components
├── public/                   # Static assets
│   ├──  locales/             # Translation files
│   └──  ├── en/              # English translations
│        └── de/              # German translations
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
└── package.json              # Project dependencies
```

## Technologies

- **React**: v19.2.0 - UI library
- **TypeScript**: v5.9.3 - Type safety
- **Vite**: v7.2.4 - Build tool and dev server
- **ESLint**: v9.39.1 - Code linting
- **Prettier**: v3.7.3 - Code formatting

## Translations

This project uses i18next for internationalization.
Translation files are located in `public/locales/` with subdirectories for each language (e.g., `en/`, `de/`).
Translation files are in the JSON format, structured as key-value pairs for easy access in the application.

When creating a compontent you need to have the following structure:

```tsx
import { useTranslation } from 'react-i18next';

export function Example() {
    const { t } = useTranslation(['common', 'otherNameSpace']);
    return (
        <div>
            <h1>{t('common:welcomeMessage')}</h1>   //If you only have using one namespasce you dont need the common: part of the refrence
        </div>
    );
}

//if you are using react formated text you need to use the version below
JSON:
{
    "welcome": "Welcome to <bold>ZurImpact</bold>! Click <link>here</link> to learn more."
}
TSX:
import { Trans } from 'react-i18next';

function Example(){
    return (
    <Trans
        i18nKey="welcome"
        ns="common"
        components={{
            bold: <strong />,
            link: <a href="/next" />,
        }}/>
    )
}

```

## VS Code Setup

### Yarn SDK Integration

To enable proper TypeScript and ESLint support in VS Code with Yarn 2.0, run:

```bash
yarn dlx @yarnpkg/sdks vscode
```

This command configures VS Code to use the correct SDK paths for TypeScript, ESLint, and other tools managed by Yarn.

## Environment Setup

This project uses:

- ES modules (`"type": "module"` in package.json)
- React 19 with automatic JSX handling
- TypeScript strict mode

## Troubleshooting

**Issue: `yarn` command not found**

- Ensure Corepack is enabled: `corepack enable`
- Verify Node.js v24+ is installed: `node --version`

**Issue: Module not found errors**

- Clear node_modules and reinstall: `rm -r node_modules && yarn install`
