# 🎮 Deploy to mainurl.com/jeopardy - Complete Guide

## Overview

Your app is now configured to work at `yourdomain.com/jeopardy` instead of the root domain.

**What I've configured:**
- ✅ `package.json` → `"homepage": "/jeopardy"`
- ✅ `.htaccess` → `RewriteBase /jeopardy/`
- ✅ AWS Polly ready (just need credentials)

---

## Quick Start

### 1. Set Up AWS Credentials (For Text-to-Speech)

Create a `.env` file in your project root:

```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_here
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

**How to get credentials:** See `AWS_POLLY_SETUP.md` for detailed instructions.

### 2. Build Your App

```bash
npm run build
```

### 3. Upload to GoDaddy

**Via FTP or cPanel File Manager:**

1. Connect to your GoDaddy hosting
2. Navigate to `public_html`
3. **Create a folder named `jeopardy`**
4. **Upload all files from the `build` folder INTO the `jeopardy` folder**

**Your structure should look like:**
```
public_html/
├── (your existing site files)
└── jeopardy/
    ├── index.html
    ├── .htaccess
    ├── favicon.ico
    ├── manifest.json
    ├── static/
    │   ├── css/
    │   ├── js/
    │   └── media/
    └── audio/
        ├── jeopardy-opening-credits-song.mp3
        └── jeopardy-theme.mp3
```

### 4. Test Your Deployment

Visit: `https://yourdomain.com/jeopardy`

The game should load at this URL!

---

## Detailed Upload Instructions

### Method 1: FTP Upload (FileZilla, Cyberduck, etc.)

1. **Connect to FTP:**
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password

2. **Navigate to public_html**

3. **Create jeopardy folder:**
   - Right-click → Create directory → Name it `jeopardy`

4. **Enter the jeopardy folder:**
   - Double-click to open it

5. **Upload files:**
   - Select all files FROM INSIDE your `build` folder
   - Drag them into the `jeopardy` folder on the server
   - Wait for upload to complete
   - **Make sure `.htaccess` is uploaded** (may be hidden - enable "Show hidden files")

### Method 2: cPanel File Manager

1. **Log into cPanel**

2. **Open File Manager**

3. **Navigate to public_html**

4. **Create new folder:**
   - Click "New Folder"
   - Name: `jeopardy`
   - Click "Create New Folder"

5. **Enter the jeopardy folder:**
   - Double-click to open it

6. **Upload files:**
   - Click "Upload"
   - Select all files from your `build` folder
   - Upload them
   - Or upload as ZIP and extract

7. **Verify .htaccess:**
   - Click "Settings" (gear icon)
   - Check "Show Hidden Files"
   - Confirm `.htaccess` is present in the `jeopardy` folder

---

## Testing Checklist

After uploading, test these:

- [ ] Visit `yourdomain.com/jeopardy` - game loads
- [ ] Click "Practice" - practice mode works
- [ ] Click "Study Flashcards" - flashcard mode works
- [ ] Select a flashcard deck - cards display
- [ ] Navigate between cards - previous/next work
- [ ] Try difficulty selection - selecting works
- [ ] Test on mobile device - responsive design works
- [ ] Click a Jeopardy question - audio reads aloud (if Polly set up)
- [ ] Check browser console (F12) - no errors

---

## Common Issues & Solutions

### Issue 1: "404 Not Found" at yourdomain.com/jeopardy

**Solution:**
- Make sure the `jeopardy` folder exists in `public_html`
- Verify files are INSIDE the `jeopardy` folder, not in a subfolder
- Check file permissions (folders: 755, files: 644)

### Issue 2: Game loads but CSS/images missing

**Solution:**
- Make sure `homepage` in `package.json` is set to `/jeopardy`
- Rebuild: `npm run build`
- Re-upload all files
- Clear browser cache (Ctrl+Shift+R)

### Issue 3: Navigation doesn't work (404 on refresh)

**Solution:**
- Verify `.htaccess` file is present in the `jeopardy` folder
- Check that `.htaccess` contains `RewriteBase /jeopardy/`
- Enable "Show Hidden Files" in File Manager to see it

### Issue 4: AWS Polly not working

**Solution:**
- Check browser console for specific error
- Verify `.env` file exists and has correct credentials
- Rebuild after creating `.env` file: `npm run build`
- See `AWS_POLLY_SETUP.md` for credential setup

### Issue 5: Blank white screen

**Solution:**
- Open browser console (F12) and check for errors
- Common causes:
  - Missing `.env` file (if Polly is required)
  - Incorrect `homepage` in `package.json`
  - Files uploaded to wrong directory
- Fix and rebuild/re-upload

---

## Updating Your Deployed App

When you make changes to your code:

1. **Make your changes**

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Delete old files from server:**
   - Go to `public_html/jeopardy/`
   - Delete everything EXCEPT the `.htaccess` file
   - Or just overwrite by uploading new files

4. **Upload new files:**
   - Upload all files from the new `build` folder

5. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)

---

## AWS Polly Credentials

**To enable text-to-speech:**

1. Follow instructions in `AWS_POLLY_SETUP.md`
2. Create `.env` file with your credentials
3. Rebuild: `npm run build`
4. Upload to GoDaddy

**Cost:** ~$0.04 per game played (~$1/month for typical personal use)

**Free Tier:** 5 million characters/month = ~2,000 games/month FREE

---

## Alternative Subdirectory Names

If you want a different path, like `yourdomain.com/games` instead:

1. **Update package.json:**
   ```json
   "homepage": "/games"
   ```

2. **Update .htaccess:**
   Change `RewriteBase /jeopardy/` to `RewriteBase /games/`

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Upload to a folder named `games` instead of `jeopardy`**

---

## Performance Tips

Your `.htaccess` file already includes:
- ✅ Compression enabled
- ✅ Browser caching configured
- ✅ Proper routing for React

**Additional optimizations:**
- Enable HTTPS (free with most GoDaddy plans)
- Use GoDaddy CDN if available
- Consider adding Cloudflare (free tier) as additional CDN

---

## File Permissions (If Needed)

If you encounter permission errors:

**Folders:** 755
```bash
chmod 755 jeopardy
chmod 755 jeopardy/static
chmod 755 jeopardy/audio
```

**Files:** 644
```bash
chmod 644 jeopardy/index.html
chmod 644 jeopardy/.htaccess
```

Most GoDaddy accounts set these automatically.

---

## Security Notes

**AWS Credentials in Browser:**

Your AWS credentials will be visible in the JavaScript code. This is OK because:
- ✅ IAM user has Polly-only access (can't do anything else)
- ✅ Can't create resources or cost you unexpected money
- ✅ Standard practice for client-side AWS services

**Best practices:**
- Set up billing alerts in AWS Console
- Monitor Polly usage regularly
- Don't use root AWS account credentials
- Use IAM user with minimal permissions (which we do)

---

## Your Live URL

Once deployed, your game will be accessible at:

**https://yourdomain.com/jeopardy**

Share this link with friends and family!

---

## Questions?

Common questions answered:
1. **Can I use root domain?** → Yes, change `homepage` to `"."`
2. **Multiple subdomains?** → Deploy separately to each
3. **Password protect?** → Use .htpasswd in GoDaddy cPanel
4. **Custom domain for just the game?** → Set up subdomain in GoDaddy

---

## Ready to Deploy!

**Your checklist:**

1. [ ] Set up AWS credentials (see `AWS_POLLY_SETUP.md`)
2. [ ] Create `.env` file with credentials
3. [ ] Run `npm run build`
4. [ ] Create `jeopardy` folder in `public_html`
5. [ ] Upload all files from `build` folder to `jeopardy` folder
6. [ ] Verify `.htaccess` is present
7. [ ] Visit `yourdomain.com/jeopardy`
8. [ ] Test all features
9. [ ] Share with friends! 🎉

---

## Support Files Reference

- `AWS_POLLY_SETUP.md` - How to get AWS credentials
- `DEPLOY_GODADDY.md` - General GoDaddy deployment
- `DEPLOYMENT.md` - All hosting options
- `QUICK_DEPLOY.md` - Quick start guide

Happy deploying! 🚀

