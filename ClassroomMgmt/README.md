# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation

Before running the application, make sure to install all dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Key Dependencies

This project uses the following main libraries:

### UI & Styling
- **@mui/material** (^6.5.0) - Material-UI component library
- **sass** (^1.78.0) - CSS preprocessor for styling

### State Management
- **@reduxjs/toolkit** (^2.11.2) - Redux Toolkit for state management
- **react-redux** (^9.2.0) - React bindings for Redux

### Charts & Data Visualization
- **chart.js** (^4.5.1) - Chart library
- **react-chartjs-2** (^5.3.1) - React wrapper for Chart.js

### Rich Text Editing
- **draft-js** (^0.11.7) - Rich text editor framework
- **react-draft-wysiwyg** (^1.15.0) - WYSIWYG editor component for React

### PDF Generation
- **jspdf** (^4.0.0) - PDF document generation
- **html2canvas** (^1.4.1) - HTML to canvas conversion for PDF export

### Internationalization
- **i18next** (^23.14.0) - Internationalization framework
- **react-i18next** (^15.0.1) - React integration for i18next
- **i18next-http-backend** (^2.6.1) - Backend plugin for i18next

### Routing
- **react-router-dom** (^6.26.1) - React routing library

### Utilities
- **classnames** (^2.5.1) - Utility for conditionally joining classNames
- **papaparse** (^5.4.1) - CSV parsing library
- **sweetalert2** (^11.14.0) - Beautiful, responsive, customizable alert dialogs

### Type Definitions
- **@types/draft-js** (^0.11.20) - TypeScript definitions for draft-js
- **@types/react-draft-wysiwyg** (^1.13.9) - TypeScript definitions for react-draft-wysiwyg
- **@types/papaparse** (^5.3.14) - TypeScript definitions for papaparse

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Microfrontend builds (instructor / student)

For deployment as microfrontends under a host app:

- **`yarn build:instructor`** (or `npm run build:instructor`)  
  Output: `build-instructor/` with `PUBLIC_URL=/instructor`.  
  Serve this app at the host path `/instructor` (e.g. `https://host/instructor/`).

- **`yarn build:student`** (or `npm run build:student`)  
  Output: `build-student/` with `PUBLIC_URL=/student`.  
  Serve this app at the host path `/student` (e.g. `https://host/student/`).

Each microfrontend build includes:

- **`index.html`** – entry page (paths use the correct base)
- **`asset-manifest.json`** – CRA manifest of all assets
- **`microfrontend.json`** – manifest for the host: `name`, `basePath`, `entry`, `styles`, `entrypoints`, `files`
- **`static/`** – JS, CSS, media
- **`locales/`** – i18n translations

The host can load an app by reading `microfrontend.json` (or `asset-manifest.json`), then injecting the `entry` script and `styles` when mounting the microfrontend. Router and i18n are configured to use the base path so links and locale requests work when served under `/instructor` or `/student`.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
