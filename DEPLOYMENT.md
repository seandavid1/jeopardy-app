# Jeopardy Game - Deployment Guide

## Quick Deploy to Netlify (Recommended - 5 minutes)

### Option A: Netlify Drop (No Command Line)
1. Run: `npm run build`
2. Wait for build to complete
3. Visit: https://app.netlify.com/drop
4. Drag and drop the entire `build` folder
5. Done! You'll get a live URL instantly

### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the app
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

Follow the prompts to connect your Netlify account and choose a site name.

---

## Alternative: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy (one command)
vercel --prod
```

---

## Alternative: Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Update homepage in package.json:
"homepage": "https://yourusername.github.io/jeopardy"

# Deploy
npm run deploy
```

---

## Manual Deployment (Any Web Host)

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Upload the `build` folder contents** to your web server's public directory

3. **Configure server routing** (important for React Router):
   
   **For Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
   
   **For Nginx (nginx.conf):**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

---

## Environment Variables

If using AWS services (Polly text-to-speech) or MongoDB:

1. Create a `.env` file in the root directory
2. Add your credentials (see `.env.example`)
3. For Netlify/Vercel, add environment variables in their dashboard

**Important:** Never commit `.env` files to Git!

---

## Testing the Build Locally

Before deploying, test the production build:

```bash
# Build
npm run build

# Serve locally
npx serve -s build
```

Visit http://localhost:3000 to test the production build.

---

## Post-Deployment Checklist

- ✅ Test all game modes (Jeopardy Practice, Study Flashcards)
- ✅ Test difficulty selection for decks with/without difficulties
- ✅ Test flashcard navigation (previous, next, skip to start/end)
- ✅ Test on mobile devices
- ✅ Check browser console for errors
- ✅ Test audio features (if using Polly)
- ✅ Verify all flashcard decks load correctly

---

## Custom Domain (Optional)

Both Netlify and Vercel offer free custom domain support:

**Netlify:** Domain settings → Add custom domain → Follow DNS instructions

**Vercel:** Domains → Add domain → Update DNS records

---

## Updating Your Deployed App

After making changes:

**Netlify/Vercel CLI:**
```bash
npm run build
netlify deploy --prod
# or
vercel --prod
```

**GitHub Pages:**
```bash
npm run deploy
```

---

## File Size Optimization

The app includes many flashcard decks. If you want to reduce bundle size:

1. Remove unused flashcard files from `src/flashcard-decks/`
2. Update `src/flashcard-decks/index.js` to exclude them
3. Rebuild

---

## Troubleshooting

**Blank page after deployment:**
- Check browser console for errors
- Verify `homepage` in package.json matches your deployment path
- Check server routing configuration

**404 on page refresh:**
- Configure server to route all requests to index.html (see server config above)

**Environment variables not working:**
- Ensure they start with `REACT_APP_`
- Restart development server after adding them
- For production, add them in hosting platform dashboard

---

## Support

For issues specific to:
- **Netlify:** https://docs.netlify.com
- **Vercel:** https://vercel.com/docs
- **GitHub Pages:** https://docs.github.com/pages

