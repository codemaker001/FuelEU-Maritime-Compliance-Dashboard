# FuelEU Maritime Compliance Dashboard

## Overview
This project is a comprehensive dashboard designed to help maritime operators manage compliance with FuelEU Maritime regulations. It provides tools for managing routes, comparing GHG intensity against baselines, banking surplus compliance units, and forming compliance pools with other vessels.

The entire application runs in the browser, using a mock API to simulate backend interactions for a seamless and interactive user experience.

## Architecture
The application is structured using a **Hexagonal Architecture** (also known as Ports and Adapters). This design pattern isolates the core application logic from external concerns like the UI or data sources.

- **`frontend/src/core`**: This is the heart of the application.
  - `domain`: Contains the core data structures and types (e.g., `Route`, `PoolMember`).
  - `application`: Holds the business logic in services (e.g., `RouteService`), which orchestrate operations.
  - `ports`: Defines the interfaces (`IRouteRepository`) that the core uses to communicate with the outside world (outbound ports).

- **`frontend/src/adapters`**: These are the implementations of the ports.
  - `ui`: The React components that form the user interface (inbound adapter). They call the application services to perform actions and get data.
  - `infrastructure`: Contains the implementation of the outbound ports. In this project, `mockApiAdapter.ts` implements the repository interfaces to provide mock data.

- **`frontend/src/container.ts`**: This is the composition root where all the services and adapters are instantiated and wired together (Dependency Injection).

This structure makes the application highly modular, testable, and easy to maintain. The mock API adapter could be easily swapped with a real HTTP client without changing any code in the core or UI.

## Setup & Run Instructions
This is a client-side only application with no build step required.

1. **Prerequisites**: You need a modern web browser.
2. **Serve the files**: Use a simple local web server to serve the project's root directory.
   - If you have Python 3: `python3 -m http.server`
   - If you have Node.js and `serve`: `npx serve .`
3. **Open in browser**: Navigate to the local address provided by your server (e.g., `http://localhost:8000`).

## How to Execute Tests
Currently, there are no automated tests for this project.

For a production-grade application, a testing strategy would include:
- **Unit Tests**: Using a framework like `Jest` and `React Testing Library` to test individual React components and application service logic.
- **Integration Tests**: Testing the interaction between the UI, services, and the data adapter to ensure they work together correctly.

## Screenshots

The application is a single-page dashboard with a clean, tab-based interface.

**Header:**
- Displays the application title "FuelEU Maritime Dashboard" with a ship icon.
- Contains the main navigation tabs: Routes, Compare, Banking, and Pooling.

**Routes Tab:**
- A table displaying all shipping routes with details like vessel type, fuel type, GHG intensity, etc.
- Filtering options for vessel, fuel, and year.
- A button on each row to set that route as the "Baseline" for comparison.

**Compare Tab:**
- A bar chart visually comparing the GHG intensity of all routes against the selected baseline and the official compliance target.
- A summary card for the baseline route.
- A detailed table showing the percentage difference and compliance status for each comparison route.

**Banking Tab:**
- A form to fetch the compliance balance for a specific ship and year.
- KPI cards displaying the balance before and after applying banked credits.
- Actions to "Bank Surplus" or "Apply from Bank" to cover a deficit.

**Pooling Tab:**
- A two-panel layout to manage compliance pools.
- The left panel lists all available ships with their compliance status.
- The right panel shows the ships currently selected for a pool, along with a real-time calculation of the pool's total compliance sum.
- A button to create the pool, which then displays a results table showing how compliance credits were balanced among members.
