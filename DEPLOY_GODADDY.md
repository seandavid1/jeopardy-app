# 🌐 Deploying to GoDaddy Hosting - Complete Guide

## Quick Overview

**YES!** Your Jeopardy app will work with GoDaddy hosting. Just build and upload.

---

## Step-by-Step Instructions

### Step 1: Build Your Production Files

```bash
npm run build
```

This creates a `build` folder with your website files.

---

### Step 2: Upload to GoDaddy

#### Method A: Using FTP (FileZilla, Cyberduck, etc.)

1. **Get your FTP credentials from GoDaddy:**
   - Log into GoDaddy account
   - Go to "Web Hosting" → Click "Manage"
   - Find FTP credentials or create new FTP account

2. **Connect via FTP:**
   - Host: `ftp.yourdomain.com` or IP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

3. **Upload files:**
   - Navigate to `public_html` folder on server
   - Upload **all files from inside the `build` folder**
   - Do NOT upload the `build` folder itself
   - Make sure `.htaccess` is uploaded (it may be hidden)

#### Method B: Using GoDaddy File Manager

1. **Access File Manager:**
   - Log into GoDaddy cPanel
   - Click "File Manager"

2. **Navigate to public_html:**
   - Open the `public_html` directory
   - Delete any existing files (like `index.html` if it's there)

3. **Upload your files:**
   - Click "Upload" button
   - Select all files from your `build` folder
   - Wait for upload to complete
   - If you uploaded a zip, extract it

---

### Step 3: Verify .htaccess File

**IMPORTANT**: The `.htaccess` file is crucial for React apps on Apache servers (which GoDaddy uses).

I've already created this file in your `public` folder, so it will automatically be included in your build.

**What it does:**
- Routes all requests to `index.html` (required for React Router)
- Enables compression for faster loading
- Sets up browser caching

**To verify it's there:**
1. In File Manager, make sure "Show Hidden Files" is enabled
2. Look for `.htaccess` in your `public_html` folder
3. If missing, create it manually with the content below

---

### Step 4: Configure Environment Variables (If Using AWS Polly)

If you're keeping the text-to-speech feature:

**Option 1: Client-side (Simple but less secure)**
- Your `.env` values are baked into the build
- Fine for low-value credentials
- Anyone can view them in browser

**Option 2: Server-side (More secure)**
- Requires GoDaddy to support Node.js backend
- Most shared hosting won't support this
- Consider using Netlify/Vercel instead for better security

**For GoDaddy shared hosting:**
Just make sure your `.env` file is in place before running `npm run build`. The values will be embedded in the JavaScript bundle.

---

## Complete Upload Checklist

After uploading, your `public_html` folder should contain:

```
public_html/
├── index.html
├── .htaccess
├── favicon.ico
├── manifest.json
├── robots.txt
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── audio/
    ├── jeopardy-opening-credits-song.mp3
    └── jeopardy-theme.mp3
```

---

## Testing Your Deployment

1. Visit your domain: `https://yourdomain.com`
2. The game should load
3. Test navigation between Practice and Study modes
4. Try a few flashcard decks
5. Check browser console (F12) for any errors

---

## Common GoDaddy Issues & Solutions

### Issue 1: "File not found" or 404 errors

**Solution:**
- Make sure `.htaccess` file is present
- Verify `.htaccess` is in the root of `public_html`
- Check that file permissions are correct (644 for files, 755 for folders)

### Issue 2: Blank white screen

**Solution:**
- Check browser console for errors (F12)
- Verify all files uploaded correctly
- Make sure you uploaded files from INSIDE `build` folder, not the folder itself
- Check if `homepage` in `package.json` is set correctly (should be `"."`)

### Issue 3: CSS/Images not loading

**Solution:**
- Clear browser cache
- Verify `static` folder uploaded correctly
- Check file permissions (should be 644)

### Issue 4: Can't see .htaccess file

**Solution:**
- In cPanel File Manager, click "Settings" (top right)
- Check "Show Hidden Files"
- Click "Save"

### Issue 5: AWS Polly errors

**Solution:**
- Either set up AWS credentials before building
- Or remove Polly dependency (I can help with this)
- Or make Polly optional (app works without it)

---

## File Size Considerations

**Total app size:** Approximately 2-3 MB

GoDaddy shared hosting typically includes:
- Economy: 25 GB storage ✅ More than enough
- Deluxe: 75 GB storage ✅ More than enough
- Ultimate: Unlimited ✅ Plenty

**Your app is tiny compared to these limits!**

---

## Subdirectory Installation (Optional)

If you want to install in a subdirectory like `yourdomain.com/jeopardy`:

1. Create a `jeopardy` folder in `public_html`
2. Upload build files to `public_html/jeopardy/`
3. Before building, update `package.json`:
   ```json
   "homepage": "/jeopardy"
   ```
4. Rebuild: `npm run build`
5. Re-upload

---

## Updating Your Site

When you make changes:

1. Make your code changes
2. Run `npm run build` again
3. Delete old files from `public_html`
4. Upload new files from `build` folder
5. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Performance Tips for GoDaddy

✅ **Already included in your .htaccess:**
- Compression enabled
- Browser caching enabled

✅ **Additional optimizations:**
1. Use GoDaddy's CDN if available (in cPanel)
2. Enable HTTPS (free with GoDaddy)
3. Consider Cloudflare as free CDN layer

---

## Cost Summary for GoDaddy

- **Hosting:** Whatever you're already paying (no extra cost)
- **AWS Polly:** ~$0.04 per game (or free tier: 2,000 games/month)
- **Total added cost:** Essentially $0 for personal use

---

## Troubleshooting Commands

If something goes wrong, check these in your browser console (F12):

```javascript
// Check if React loaded
console.log(window.React);

// Check current URL
console.log(window.location);

// Check for errors
// Look in the Console tab
```

---

## Need Help?

Common issues:
1. White screen → Check console for errors, verify .htaccess
2. 404 errors → .htaccess missing or incorrect
3. Files not found → Wrong upload directory
4. Styling broken → Cache issue, hard refresh browser

---

## Quick Reference: FTP Commands

If using command-line FTP:

```bash
# Connect
ftp ftp.yourdomain.com

# Navigate to public_html
cd public_html

# Upload files
mput build/*

# Disconnect
bye
```

---

## The .htaccess File

I've already created this in your `public` folder. Here's what's in it:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  # ... caching rules ...
</IfModule>
```

This will automatically be included when you run `npm run build`.

---

## Ready to Deploy!

You're all set! Just run:

```bash
npm run build
```

Then upload the contents of the `build` folder to your GoDaddy `public_html` directory, and you're live! 🚀

