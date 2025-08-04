This workspace contains a Next.js TypeScript single page application.

## Project Setup Complete ✅

- [x] Next.js TypeScript application created with App Router
- [x] Tailwind CSS configured for styling
- [x] ESLint configured for code quality
- [x] Src directory structure enabled
- [x] Project compiled successfully
- [x] Development server running at http://localhost:3000

## Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Quality Guidelines

### TypeScript & ESLint Rules
- **No unused variables**: Remove any declared but unused variables to prevent `@typescript-eslint/no-unused-vars` warnings
- **No explicit `any` types**: Always use proper TypeScript types instead of `any` to prevent `@typescript-eslint/no-explicit-any` errors
  - For Chart.js tooltip callbacks, use `TooltipItem<'bar' | 'pie'>` from `chart.js` instead of `any`
  - Import specific types: `import { TooltipItem } from 'chart.js'`
- **Always run `npm run build` before committing** to catch TypeScript and ESLint issues early
- **Prefer specific imports**: Import only the types and components you need

### Chart.js Integration
- When using Chart.js with TypeScript, always import proper types:
  ```typescript
  import { Chart as ChartJS, TooltipItem } from 'chart.js';
  
  // Use TooltipItem instead of any
  label: function(context: TooltipItem<'bar'>) {
    // tooltip logic
  }
  ```

The application is ready for development!
