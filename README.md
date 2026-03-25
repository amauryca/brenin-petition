# Brenin Petition - Server Setup

This petition app now uses a Node.js server to track clicks automatically across all pages.

## Setup & Installation

1. **Install Node.js** (if you haven't already)
   - Download from https://nodejs.org/

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the server**
   ```
   npm start
   ```

4. **Visit the app**
   - Open http://localhost:3000 in your browser

## Features

- ✓ Click counter stored on the server (persistent)
- ✓ One click per day limit enforced by server
- ✓ Auto-updates every 3 seconds across all tabs/browsers
- ✓ Real-time synchronization

## How it Works

- Clicks are sent to the server via `/api/clicks` endpoint
- Server stores the click count and date in `data.json`
- Client polls the server every 3 seconds to check for updates
- If multiple people open the site, they all see the same counter

## Stopping the Server

Press `Ctrl+C` in the terminal
