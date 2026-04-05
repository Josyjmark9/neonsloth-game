# Deployment Guide for NeonSloth Game

This guide provides instructions on how to deploy your React + Vite application to **Google Cloud Run** and **GitHub Pages**.

---

## 1. Google Cloud Run Deployment

Google Cloud Run is a fully managed platform that automatically scales your stateless containers. Since this is a static React app, we will use a simple Express server to serve the production build.

### Step 1: Create a Server Entry Point
Create a file named `server.ts` in the root directory to serve the static files from the `dist` folder.

```typescript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Step 2: Update `package.json`
Add a `start` script to your `package.json`:
```json
"scripts": {
  ...
  "start": "tsx server.ts"
}
```

### Step 3: Create a `Dockerfile`
Create a `Dockerfile` in the root directory:

```dockerfile
# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/package*.json ./
RUN npm install --production
RUN npm install -g tsx
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 4: Deploy to Cloud Run
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Run the following command in your terminal:
   ```bash
   gcloud run deploy neonsloth-game --source . --region us-central1 --allow-unauthenticated
   ```

---

## 2. GitHub Pages Deployment

Since you've already configured your `vite.config.ts` with a conditional `base` path, deploying to GitHub Pages is straightforward.

### Step 1: Ensure `vite.config.ts` is Ready
Your current configuration should look like this:
```typescript
base: '/',
```

### Step 2: Automated Deployment via GitHub Actions
Create a file named `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # or your default branch name

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Enable GitHub Pages in Settings
1. Go to your repository on GitHub.
2. Click **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.

Once you push your code to the `main` branch, the action will automatically build and deploy your game to `https://<your-username>.github.io/neonsloth-game/`.

---

## 3. Firebase Configuration
Don't forget to add your production domain to the **Authorized Domains** list in the Firebase Console (Authentication > Settings > Authorized Domains) to ensure Google Login works correctly on your deployed site.
