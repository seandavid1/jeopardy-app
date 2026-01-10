# 🎮 Jeopardy Practice Game - Quick Deploy Guide

## Deploy in 3 Easy Steps

### Option 1: Netlify Drop (Easiest - No Command Line Required!)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Go to:** https://app.netlify.com/drop

3. **Drag and drop** the `build` folder to the page

4. **Done!** You'll get a live URL like `https://random-name-123.netlify.app`

---

### Option 2: One-Command Deploy Script

Simply run:
```bash
./deploy.sh
```

This will build your app and give you deployment options.

---

### Option 3: Automated Deployment

**Netlify:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

---

## Testing Before Deploy

Test the production build locally:
```bash
npm run build
npx serve -s build
```
Then visit http://localhost:3000

---

## What You Get

Your deployed Jeopardy app includes:
- ✅ Full Jeopardy! practice game with 8 seasons of questions
- ✅ Study flashcards with 40+ decks
- ✅ Multiple difficulty levels
- ✅ Score tracking and missed question review
- ✅ Mobile-responsive design
- ✅ Flashcard navigation (skip to start/end)
- ✅ Difficulty-based statistics

---

## File Size

The built app is approximately 2-3 MB (mostly flashcard data).

---

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

## Quick Tips

- **Free hosting:** Netlify, Vercel, GitHub Pages all offer free hosting
- **Custom domain:** Both Netlify and Vercel support free custom domains
- **Updates:** Just rebuild and redeploy to update your site
- **No server needed:** This is a static site (HTML/CSS/JS only)

Happy deploying! 🚀

