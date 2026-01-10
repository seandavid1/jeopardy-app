# AWS Polly Setup Guide for Jeopardy Game

## What You Need

AWS credentials to enable text-to-speech for reading questions aloud.

---

## Step 1: Create AWS Account (if you don't have one)

1. Go to: https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but we'll use free tier)

**Free Tier Includes:**
- 5 million characters per month for 12 months
- That's about **2,000 games per month FREE**

---

## Step 2: Create IAM User with Polly Access

1. **Go to IAM Console:**
   https://console.aws.amazon.com/iam/

2. **Create a new user:**
   - Click "Users" in left sidebar
   - Click "Add users" button
   - User name: `jeopardy-polly-user`
   - Access type: Check "Programmatic access"
   - Click "Next: Permissions"

3. **Set permissions:**
   - Click "Attach existing policies directly"
   - Search for: `Polly`
   - Check the box for: **"AmazonPollyReadOnlyAccess"**
   - Click "Next: Tags" (skip tags)
   - Click "Next: Review"
   - Click "Create user"

4. **SAVE YOUR CREDENTIALS:**
   ⚠️ **IMPORTANT:** This is the ONLY time you'll see the secret key!
   
   You'll see:
   - Access key ID (starts with AKIA...)
   - Secret access key (long random string)
   
   **Download the CSV or copy both values somewhere safe**

---

## Step 3: Create .env File in Your Project

1. **In your project folder** (`/Users/seanrobinson/Downloads/Jeopardy/`), create a file named `.env`

2. **Add this content** (replace with your actual credentials):

```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

3. **Save the file**

---

## Step 4: Build Your App

Now when you build, the credentials will be embedded:

```bash
npm run build
```

---

## Security Note

**For Public Hosting:**

Your AWS credentials will be visible in the browser's JavaScript code. This is generally OK for read-only services like Polly, but:

✅ **Recommended practices:**
- Use IAM policy to restrict to Polly only (which we did)
- Set spending alerts in AWS Console
- Monitor usage regularly

⚠️ **DON'T:**
- Use credentials with admin access
- Use credentials that can create resources
- Use credentials that can access your other AWS services

**The credentials we created can ONLY read text-to-speech, nothing else.**

---

## Cost Monitoring

Set up a billing alarm (optional but recommended):

1. Go to: https://console.aws.amazon.com/billing/
2. Click "Billing preferences" 
3. Enable "Receive Billing Alerts"
4. Go to CloudWatch: https://console.aws.amazon.com/cloudwatch/
5. Create alarm for when costs exceed $5

---

## Testing Your Setup

Before building, test that Polly works:

1. Start your development server:
   ```bash
   npm start
   ```

2. Open browser console (F12)

3. Look for these messages:
   - "AWS Configuration loaded"
   - "Polly client initialized successfully"

4. Play a Jeopardy question - it should read aloud

If you see errors, check:
- `.env` file exists in project root
- Credentials are correct (no extra spaces)
- IAM user has Polly permissions

---

## Troubleshooting

### Error: "AWS credentials are not properly configured"

**Solution:** 
- Make sure `.env` file exists
- Check that variable names start with `REACT_APP_`
- Restart development server after creating `.env`

### Error: "AccessDenied" or "The security token included in the request is invalid"

**Solution:**
- Credentials are wrong - double-check them
- Recreate IAM user if needed
- Make sure you copied Access Key ID AND Secret Access Key

### Error: "User: arn:aws:iam::... is not authorized to perform: polly:SynthesizeSpeech"

**Solution:**
- IAM user doesn't have Polly permissions
- Go back to IAM Console
- Click on your user
- Click "Add permissions"
- Attach "AmazonPollyReadOnlyAccess" policy

---

## Alternative: Use AWS Cognito (More Secure)

For production apps with high traffic, consider AWS Cognito for temporary credentials. This is more complex but more secure. Let me know if you need help with this.

---

## Quick Reference

**AWS IAM Console:** https://console.aws.amazon.com/iam/  
**AWS Polly Pricing:** https://aws.amazon.com/polly/pricing/  
**AWS Free Tier:** https://aws.amazon.com/free/

**Your credentials should look like:**
```
Access Key ID: AKIAIOSFODNN7EXAMPLE (starts with AKIA)
Secret Access Key: wJalrXUtnFEMI/K7MDENG/... (long random string)
```

---

## Need Help?

Common issues:
1. **No audio** → Check browser console for Polly errors
2. **AccessDenied** → Check IAM permissions
3. **Invalid credentials** → Verify .env file content
4. **CORS errors** → This shouldn't happen with Polly, but check AWS region

Your app is configured to use:
- Region: `us-east-1`
- Voice: `Stephen` (US Male)
- Engine: `neural` (highest quality)

