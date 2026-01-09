# Project Overview

This project is a Medical Representatives Management System. It uses a modern web stack with **React** and **Vite** for the frontend, **Convex** as the backend, and **Tailwind CSS** for styling. The application includes authentication powered by Convex Auth.

## Technologies Used

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Backend:** Convex (including Convex Auth for anonymous sign-in)
*   **Language:** TypeScript

## Project Structure

*   `src/`: Contains the frontend React application code.
*   `convex/`: Contains the backend Convex functions, schema, and API routes.
*   `public/`: Static assets.

## Building and Running

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Start Development Servers (Frontend and Backend):**
    ```bash
    npm run dev
    ```
    This command will start both the Vite frontend development server and the Convex backend development server. The frontend will automatically open in your browser.
*   **Start Frontend Only:**
    ```bash
    npm run dev:frontend
    ```
*   **Start Backend Only:**
    ```bash
    npm run dev:backend
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
    This compiles the frontend for production deployment.
*   **Lint and Type Check:**
    ```bash
    npm run lint
    ```
    This command runs TypeScript type checking for both frontend and backend and also runs Convex development checks.

## Development Conventions

*   **Code Formatting:** The project uses Prettier (likely integrated with ESLint) for code formatting.
*   **Linting:** ESLint is used for identifying and reporting on patterns in JavaScript/TypeScript code.
*   **Type Checking:** TypeScript is used throughout the project for type safety.
*   **Styling:** Tailwind CSS is used for utility-first styling.
