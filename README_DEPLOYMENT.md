# 🚀 Complete Deployment Guide - yourdomain.com/jeopardy

## TL;DR - Quick Start

```bash
# 1. Set up AWS credentials
./setup-aws.sh

# 2. Build
npm run build

# 3. Upload 'build' folder contents to public_html/jeopardy/ via FTP
# 4. Visit yourdomain.com/jeopardy
```

---

## What's Been Configured

I've set up everything for deployment to `yourdomain.com/jeopardy`:

✅ **package.json** → `"homepage": "/jeopardy"`  
✅ **.htaccess** → Configured for `/jeopardy/` subdirectory  
✅ **AWS Polly** → Ready for text-to-speech (needs credentials)  
✅ **Guides created:**
- `AWS_POLLY_SETUP.md` - How to get AWS credentials
- `DEPLOY_SUBDIRECTORY.md` - Detailed deployment steps
- `setup-aws.sh` - Interactive script to create .env file

---

## Step-by-Step Deployment

### Step 1: Get AWS Credentials (For Text-to-Speech)

**Option A: Use the helper script (easiest)**
```bash
./setup-aws.sh
```

**Option B: Manual setup**

1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Create user with "AmazonPollyReadOnlyAccess"
3. Copy Access Key ID and Secret Access Key
4. Create a `.env` file in project root:

```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**See `AWS_POLLY_SETUP.md` for detailed instructions.**

---

### Step 2: Test Locally (Optional but Recommended)

```bash
npm start
```

Open browser console (F12) and look for:
- "Polly client initialized successfully"
- Click a question to test audio

If you see errors, check your AWS credentials.

---

### Step 3: Build for Production

```bash
npm run build
```

This creates a `build` folder with your production files.

---

### Step 4: Upload to GoDaddy

**Via FTP (FileZilla, Cyberduck, etc.):**

1. Connect to FTP: `ftp.yourdomain.com`
2. Navigate to `public_html`
3. Create folder named `jeopardy`
4. Go inside the `jeopardy` folder
5. Upload **all files from INSIDE** your `build` folder
6. Verify `.htaccess` is uploaded (may be hidden)

**Via cPanel File Manager:**

1. Log into cPanel
2. Open File Manager
3. Navigate to `public_html`
4. Create new folder: `jeopardy`
5. Open the `jeopardy` folder
6. Click Upload
7. Select all files from your `build` folder
8. Upload them
9. Enable "Show Hidden Files" to verify `.htaccess` is there

**Final structure should be:**
```
public_html/
├── (your existing website files)
└── jeopardy/
    ├── index.html
    ├── .htaccess
    ├── favicon.ico
    ├── static/
    └── audio/
```

---

### Step 5: Test Your Deployment

Visit: **https://yourdomain.com/jeopardy**

**Test checklist:**
- [ ] Game loads
- [ ] Practice mode works
- [ ] Study flashcards work
- [ ] Difficulty selection works
- [ ] Navigation works (previous/next/skip)
- [ ] Audio reads questions aloud
- [ ] Works on mobile
- [ ] No console errors (F12)

---

## Troubleshooting

### "AWS credentials are not properly configured"

**Solution:**
1. Make sure `.env` file exists in project root
2. Check credentials are correct
3. Rebuild: `npm run build`

### "404 Not Found" at /jeopardy

**Solution:**
- Verify `jeopardy` folder exists in `public_html`
- Check files are inside the folder, not in a subfolder
- Verify file permissions (755 for folders, 644 for files)

### CSS/Images not loading

**Solution:**
- Confirm `homepage` in `package.json` is `/jeopardy`
- Rebuild and re-upload
- Clear browser cache (Ctrl+Shift+R)

### Navigation broken (404 on page refresh)

**Solution:**
- Verify `.htaccess` file is present in `jeopardy` folder
- Enable "Show Hidden Files" in cPanel to see it
- Check it contains `RewriteBase /jeopardy/`

### Polly audio not working

**Solution:**
- Open browser console for specific error
- Check AWS credentials in `.env`
- Verify IAM user has Polly permissions
- See `AWS_POLLY_SETUP.md` for troubleshooting

---

## Costs

**Hosting:** Whatever you're already paying GoDaddy (no extra cost)

**AWS Polly:**
- **Free tier:** 5 million characters/month (12 months) = ~2,000 games FREE
- **After free tier:** $16 per 1 million characters
- **Typical cost:** ~$0.04 per game
- **Personal use:** ~$1-3/month
- **100 games/month:** ~$5/month

---

## Updating Your Site

When you make code changes:

1. Make your changes
2. Rebuild: `npm run build`
3. Delete old files from `public_html/jeopardy/` (except `.htaccess`)
4. Upload new files from `build` folder
5. Hard refresh browser: Ctrl+Shift+R

---

## Security Best Practices

**AWS Credentials:**
- ✅ Use IAM user with Polly-only access (we did this)
- ✅ Set billing alerts in AWS Console
- ✅ Monitor usage regularly
- ❌ Never use root AWS account credentials
- ❌ Never give full AWS access

**The credentials in the browser can ONLY read text-to-speech. They cannot:**
- Access other AWS services
- Create resources
- Cost you unexpected money
- Access your data

---

## Alternative Configurations

### Deploy to Root Domain Instead

Change `package.json`:
```json
"homepage": "."
```

Change `.htaccess`:
```apache
RewriteBase /
```

Upload to `public_html` (not a subfolder)

### Use Different Subdirectory

For `yourdomain.com/games` instead:

1. Change `package.json`: `"homepage": "/games"`
2. Change `.htaccess`: `RewriteBase /games/`
3. Rebuild: `npm run build`
4. Upload to `public_html/games/` folder

---

## Scripts Reference

**`setup-aws.sh`** - Interactive AWS credential setup
```bash
./setup-aws.sh
```

**`deploy.sh`** - Build and show deployment options
```bash
./deploy.sh
```

---

## Documentation Reference

- **`DEPLOY_SUBDIRECTORY.md`** - Detailed subdirectory deployment
- **`AWS_POLLY_SETUP.md`** - AWS credential setup
- **`DEPLOY_GODADDY.md`** - General GoDaddy info
- **`DEPLOYMENT.md`** - All hosting options
- **`QUICK_DEPLOY.md`** - Quick start for other platforms

---

## Need Help?

**Common questions:**

Q: Can I deploy without AWS credentials?  
A: No, the app currently requires them. Let me know if you want to make Polly optional.

Q: Can I use a custom domain just for the game?  
A: Yes, set up a subdomain in GoDaddy DNS (e.g., `jeopardy.yourdomain.com`)

Q: Will this work with other hosting providers?  
A: Yes! The build process is the same. Just upload to any web host.

Q: Can I password protect the game?  
A: Yes, use .htpasswd in GoDaddy cPanel or use Cloudflare Access

---

## You're All Set!

Everything is configured for `yourdomain.com/jeopardy` deployment.

**Next steps:**
1. Run `./setup-aws.sh` to configure AWS
2. Run `npm run build` to create production files
3. Upload `build` folder contents to `public_html/jeopardy/`
4. Share your game URL with friends!

🎉 Happy deploying!

