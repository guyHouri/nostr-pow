# **Vite Project Config**

[Creating a project	1](#creating-a-project)

[Why we have tsconfig and why are there 3 ts configs?	1](#why-we-have-tsconfig-and-why-are-there-3-ts-configs?)

[Path Aliases	2](#path-aliases)

[Debugging VSCode \+ Chrome	3](#debugging-vscode-+-chrome)

[**Linting and Formatting	4**](#linting-and-formatting)

[Linter VS Formatter	4](#linter-vs-formatter)

[Prettier Config	4](#prettier-config)

[CRLF VS LF	7](#crlf-vs-lf)

[Work TODO	7](#work-todo)

[**Adding Libraries	7**](#adding-libraries)

[Config Tailwind	7](#config-tailwind)

[React Query (Tanstack)	8](#react-query-\(tanstack\))

[Running .ts scripts	8](#running-.ts-scripts)

[**Attachments	8**](#attachments)

[Why PNPM Is better Than NPM?	8](#why-pnpm-is-better-than-npm?)

### Creating a project {#creating-a-project}

| Pnpm create vite@latest your-project-name |
| :---- |

Choose react, typescript \+ swc

**Pnpm** \- preferred over NPM (disk efficiency, speed, monorepo support , strictness & symlinks \- avoiding “phantom  dependencies”

**SWC** \- speedy web compiler. Written in rust for fast transpilation (.tsx, .ts \-\> .js)

### Why we have tsconfig and why are there 3 ts configs? {#why-we-have-tsconfig-and-why-are-there-3-ts-configs?}

**Typescript Compiler VS Vite Compiler?**  
Vite itself does NOT use tsc to convert your .ts or .tsx files into .js for the browser or for the final production bundle. For that, Vite uses its incredibly fast internal transpilers (SWC).

However, tsc (the TypeScript compiler) is still essential for two main reasons:  
Static Type Checking, Generating Declaration Files (.d.ts) \- (If you're building a Library)

**tsconfig.json** \- main configuration file that defines the overall TypeScript project structure. It doesn't typically compile any files directly ("files": \[\] is common here).  
 It uses the "references" array to point to tsconfig.app.json and tsconfig.node.json. This tells the TypeScript compiler that these are separate, independent sub-projects within the larger workspace.   
**tsconfig.app.json** \- (For Client-Side / Browser Code):  
It includes DOM and DOM.Iterable in its lib array, enables jsx, and includes vite/client in its types.  
**tsconfig.node.json** \- (For Node.js / Build Tool Code):  
It includes node in its types array (to get types for fs, path, \_\_dirname, etc.) and does not include DOM or jsx by default.

### Path Aliases {#path-aliases}

Allows you to define custom "shortcuts" for import paths (e.g., @/ maps to src/).

**Vite Config alias**

| // vite.config.tsimport path from 'path'; // Needed for path.resolveexport default defineConfig({  // ...  resolve: {    alias: {      '@': path.resolve(\_\_dirname, './src'), // Maps '@' to the absolute path of your 'src' directory    },  },  // ...}); |
| :---- |

**Tsc config alias**  
Because we have 2 separate files we will create ‘tsconfig.base.json’ that they will extend from

|  {  "compilerOptions": {    "baseUrl": ".", // tells TS where to resolve non-relative paths from    "paths": {      "@/\*": \["./src/\*"\] // Define alias     },  }} |
| :---- |

In both the config files we will add before compiler options:  
"extends": "./tsconfig.base.json",

### Debugging VSCode \+ Chrome {#debugging-vscode-+-chrome}

Chrome needs to be launched with its remote debugging protocol enabled.  
It is unrecommended to always run on debug mode for security reasons.  
I tried running it with my personal user but it failed and could’nt figure out why, so i created a new folder for VSCodeDebugProfile (windows \- C:\\Users\\user\\AppData\\Local\\Google\\Chrome)  
And first time i ran the debug i configured this user to have react devtools extension.  
This will be a global user for me to use for projects. But you can also open a debug user for every project. The location of the folder does not matter.

Under .vscode folder i created launch.json file:

| {    "version": "0.2.0",    "configurations": \[        {            "type": "chrome",            "request": "launch",            "name": "Launch Chrome \- Debug Profile",            "url": "http://localhost:5173", // Vite Dev URL            "webRoot": "${workspaceFolder}",            "userDataDir": "${env:LOCALAPPDATA}/Google/Chrome/VSCodeDebugProfile",        }    \]} |
| :---- |

 You can add breakpoints  
Or type Debugger and it will enter the debug state.

### 

## **Linting and Formatting** {#linting-and-formatting}

### Linter VS Formatter {#linter-vs-formatter}

Linter \- identifies Potential Errors, enforces Coding Standards, can Detect vulnerabilities.  
Formatter \- code aesthetics and consistency.

**\*** **For new projects I might consider using BiomeJS, as it combines linting and formatting together.**

### Prettier Config {#prettier-config}

**Installing**

| Pnpm add \-D prettier eslint-plugin-prettier eslint-config-prettier |
| :---- |

\-D flag: –save-dev  
Eslint-plugin-prettier \- allows eslint to integrate prettier  
Prettier \- the prettier engine  
Eslilnt-config-prettier \- prevents eslint and prettier conflicts

**Adding prettier to eslint**  
“For flat configuration, this plugin (eslint-plugin-prettier) ships with an eslint-plugin-prettier/recommended config that sets up both eslint-plugin-prettier and eslint-config-prettier in one go.”

// eslint.config.js (newer version, with flat config ES8+)  
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

2 placing options:

1. Placing eslintPluginPrettierRecommended in extends  
2. Placing eslintPluginPrettierRecommended in the Top-Level Array

While both seem to work. The [Docs](https://github.com/prettier/eslint-plugin-prettier) explicitly say: “Add it as the last item in the configuration array in your eslint.config.js file so that eslint-config-prettier has the opportunity to override other configs:”

So i did the second option.

| export default tseslint.config(\[  globalIgnores(\['dist'\]),  {    files: \['\*\*/\*.{ts,tsx}'\],    extends: \[      js.configs.recommended,      tseslint.configs.recommended,      reactHooks.configs\['recommended-latest'\],      reactRefresh.configs.vite,    \],    languageOptions: {      ecmaVersion: 2020,      globals: globals.browser,    },  },  eslintPluginPrettierRecommended, // top-level config object to ensure its rules apply broadly and override conflicting rules from earlier config\]); |
| :---- |

**Config File**  
Instead of Pretteirrc.json I created .prettierrc.js which is also supported, in order to add comments. I think this can be achieved with json5 parsing configuration as well but it didn’t work off the bat.  
\* Also i tried using .prettierrc.js but this file is processed by node.js which doesnt handle ts files so i left it.

**\* Another Error I had is if I change .prettierrc.js (and if it's .json) \- it does not update the configuration. I have to reload VSCode for this to happen. This is really frustrating but I left this bug for now.**

Some starting standards:

| export default {  singleQuote: true, // ensure consistency.  semi: true, // Safer. Avioids issues with automatic semicolon insertion from js.  tabwidth: 2,}; |
| :---- |

**VSCode Configuration**  
Extensions \- Add ESLint and Prettier \- to get errors in red shown.

// settings.json

| // format / lint"editor.formatOnSave": true,  "\[json\]": {    "editor.defaultFormatter": "vscode.json-language-features"  },  "\[javascript\]": { // js files    "editor.defaultFormatter": "esbenp.prettier-vscode"  },  "\[typescript\]": { // ts files    "editor.defaultFormatter": "esbenp.prettier-vscode"  },  "\[javascriptreact\]": { // jsx files    "editor.defaultFormatter": "esbenp.prettier-vscode"  },  "\[typescriptreact\]": { // tsx files    "editor.defaultFormatter": "esbenp.prettier-vscode"  }, |
| :---- |

I don’t want prettier as my default formatter, if i’ll have different python/java files in this directory. We can also create .vscode directory in main root and add settings.json file for this specific project.

### CRLF VS LF {#crlf-vs-lf}

If you are working with windows you probably have a CRLF file ending. What does it mean?   
Carriage Return (CR): \\r (moves the cursor to the beginning of the line)  
Line Feed (LF): \\n (moves the cursor down to the next line)  
Prettier has default "endOfLine": "lf".  
So we will get errors and will need to change in VSCode from CRLF to LF  
Ctrl Shit P \-\> settings ui  
![][image1]

### Work TODO {#work-todo}

Fix Tanstack Eslint, Prettier auto load. Switching to BiomeJS?

## **Adding Libraries** {#adding-libraries}

### Config Tailwind {#config-tailwind}

Pnpm add tailwindcss @tailwindcss/vite

//vite.config.ts  
import tailwindcss from '@tailwindcss/vite'  
plugins: \[react(), tailwindcss()\]

// App.CSS  
@import "tailwindcss";

Tailwind Formatter:  
Pnpm add \-D prettier-plugin-tailwindcss  
// .prettierrc.js  
plugins: \['prettier-plugin-tailwindcss'\]

### React Query (Tanstack) {#react-query-(tanstack)}

pnpm add @tanstack/react-query  
pnpm add \-D @tanstack/eslint-plugin-query  
**\* Had problem adding the eslint plugin.**

For configuring the queryClient i chose a different .tsx wrapper component for the code to be cleaner. There is also a configuration for implementing devtools which i created in a different file.

The global type is to let typescript know we added a type. And we would like to add tanstack to window only on development

| // src/utils/tanstackDevtools.tsimport { QueryClient } from '@tanstack/react-query';declare global {  interface Window {    \_\_TANSTACK\_QUERY\_CLIENT\_\_: QueryClient;  }}export function connectQueryClientToDevTools(queryClient: QueryClient): void {  window.\_\_TANSTACK\_QUERY\_CLIENT\_\_ \= queryClient;} |
| :---- |

**Config Node Types**  
In tsconfig.app.json i had to add node to types  
To let ts know about process.env.NODE\_ENV var  
So i added "types": \["vite/client", "node"\] (inside compiler options)

For the wrapper component  
// src/components/TanStackQueryWrapper.tsx

| import React from 'react';import { QueryClient, QueryClientProvider } from '@tanstack/react-query';import { connectQueryClientToDevTools } from '@/utils/tanstackDevtools';declare global {  interface Window {    \_\_TANSTACK\_QUERY\_CLIENT\_\_: QueryClient;  }}// Create a single instance of the QueryClient outside the component// so it's not recreated on every render.const queryClient \= new QueryClient();// Connect the query client to the window object for DevTools, only in developmentif (process.env.NODE\_ENV \=== 'development') {  connectQueryClientToDevTools(queryClient);}interface TanstackQueryWrapperProps {  children: React.ReactNode;}/\*\* \* A wrapper component that sets up the TanStack Query client and provider, \* and includes the DevTools for development environments. \*/export function TanstackQueryWrapper({ children }: TanstackQueryWrapperProps) {  return (    \<QueryClientProvider client={queryClient}\>{children}\</QueryClientProvider\>  );} |
| :---- |

Which i added in main.tsx

### Running .ts scripts {#running-.ts-scripts}

Pnpm add \-D @types/node tsx  
**tsx** \- command-line tool that allows you to directly run TypeScript files in Node.js without needing a separate pre-compilation step. (better than ts-node)  
**types/node** \- provides type declarations (or "typings") for Node.js's built-in APIs and global objects.  
Running \- “pnpm tsx ./scripts/generate-data.ts”

The scripts folder have to be included in tsconfg.node.json for the compiler to work properly  
"include": \["vite.config.ts", "scripts"\]

### Json-Server

pnpm add \-D json-server  
Running server \- json-server \--watch public/sites.json \--port 3001  
For pagination \- we have \_page and \_limit

## **Attachments** {#attachments}

### Why PNPM Is better Than NPM? {#why-pnpm-is-better-than-npm?}

**Disk Space Efficiency** \- In NPM if two projects depend on, say, lodash@4.17.21, they will both have a full copy of lodash downloaded and stored on your disk within their respective node\_modules.  
pnpm (Content-Addressable Store): When you install a package It's downloaded once to a central, global location on your disk (the content-addressable store).  
When a project needs that package, pnpm creates hard links (or symlinks on Windows, which are effectively just pointers) from your project's node\_modules to that central store.

**Parallelism**: pnpm is generally optimized for parallel downloading and linking, contributing to faster initial installs compared to npm in many scenarios.

**Strictness in Dependency Management** \- npm/Yarn Classic (Hoisting & Phantom Dependencies): The flat node\_modules structure of npm (and classic yarn) can lead to "phantom dependencies." This means your project might accidentally be using a package that is a dependency of one of your dependencies, but not explicitly declared as your own direct dependency in package.json. Your code might work, but if that transitive dependency changes or is removed by your direct dependency, your project can break unexpectedly.  
pnpm (Strictness & Symlinks): pnpm creates a non-flat node\_modules structure where direct dependencies are symlinked from the content-addressable store, and their dependencies are then symlinked within their own node\_modules folder (nested).

**Monorepo Support** \- pnpm has first-class, built-in support for monorepos (workspaces). Its pnpm-workspace.yaml file allows you to easily manage multiple projects within a single repository. It's often praised for its simplicity and efficiency in monorepo setups compared to npm's or yarn's workspace implementations.

[image1]: <data:image/png;base64,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>