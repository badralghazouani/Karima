# File Upload System Setup Guide

This guide explains how to configure and use the file upload system in Karima.

## Table of Contents
1. [Overview](#overview)
2. [Choose Your Provider](#choose-your-provider)
3. [AWS S3 Setup](#aws-s3-setup)
4. [Cloudinary Setup](#cloudinary-setup)
5. [Usage in Code](#usage-in-code)
6. [File Types and Limits](#file-types-and-limits)

---

## Overview

Karima supports file uploads for:
- **Course thumbnails** (images)
- **Lesson videos** (videos)
- **Course documents** (PDF, Word, Excel)
- **User avatars** (images)

You can use either **AWS S3** or **Cloudinary** as your file storage provider.

---

## Choose Your Provider

### AWS S3
**Pros:**
- More control over storage
- Lower costs at scale
- Can use CloudFront CDN
- Industry standard

**Cons:**
- More complex setup
- Requires AWS account configuration
- Need to manage buckets and permissions

### Cloudinary
**Pros:**
- Easier setup
- Built-in image/video optimization
- Automatic format conversion
- Great free tier

**Cons:**
- Higher costs at scale
- Less control over storage

**Recommendation:** Use Cloudinary for development and small projects, AWS S3 for production at scale.

---

## AWS S3 Setup

### 1. Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Sign up for an account
3. Complete verification

### 2. Create S3 Bucket
1. Go to AWS Console > S3
2. Click "Create bucket"
3. Enter bucket name: `karima-course-files`
4. Choose region: `us-east-1` (or your preferred region)
5. **Block Public Access:** Uncheck (we'll configure CORS properly)
6. Click "Create bucket"

### 3. Configure Bucket CORS
1. Go to your bucket
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Create IAM User
1. Go to AWS Console > IAM
2. Click "Users" > "Add users"
3. Username: `karima-uploader`
4. Access type: "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search and select: `AmazonS3FullAccess` (or create custom policy)
8. Click through to "Create user"
9. **Save Access Key ID and Secret Access Key**

### 5. Configure Environment Variables
Add to `.env`:

```bash
# Upload Provider
UPLOAD_PROVIDER="s3"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="karima-course-files"
```

---

## Cloudinary Setup

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Complete email verification

### 2. Get Credentials
1. Go to Dashboard
2. You'll see:
   - **Cloud name**
   - **API Key**
   - **API Secret**

### 3. Configure Environment Variables
Add to `.env`:

```bash
# Upload Provider
UPLOAD_PROVIDER="cloudinary"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. (Optional) Configure Upload Presets
For additional security and automation:

1. Go to Settings > Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Configure preset settings
5. Save preset name for later use

---

## Usage in Code

### Upload Component

```typescript
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  type="image"
  folder="course-thumbnails"
  onUpload={(url) => setThumbnailUrl(url)}
  currentUrl={currentThumbnail}
  label="Upload Course Thumbnail"
  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

### API Endpoint

```typescript
// POST /api/upload
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'image'); // or 'video', 'document'
formData.append('folder', 'avatars');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url } = await response.json();
```

---

## File Types and Limits

### Images
**Allowed types:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- GIF (`.gif`)

**Max size:** 5MB

**Use cases:**
- Course thumbnails
- User avatars
- Instructor photos

### Videos
**Allowed types:**
- MP4 (`.mp4`)
- WebM (`.webm`)
- QuickTime (`.mov`)

**Max size:** 500MB

**Use cases:**
- Lesson videos
- Course previews

**Recommendation:** For large videos, consider using:
- **Mux** (video streaming platform)
- **Vimeo** (simpler integration)
- Upload to YouTube/Vimeo and embed

### Documents
**Allowed types:**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

**Max size:** 10MB

**Use cases:**
- Course materials
- Homework assignments
- Resources
- Certificates

---

## Security Best Practices

### 1. File Validation
- ✅ Always validate file type server-side
- ✅ Check file size limits
- ✅ Sanitize filenames
- ✅ Scan for malware (optional)

### 2. Access Control
- ✅ Require authentication for uploads
- ✅ Verify user owns the resource
- ✅ Use signed URLs for private content
- ✅ Implement rate limiting

### 3. Storage Security
- ✅ Use HTTPS for all transfers
- ✅ Enable bucket encryption
- ✅ Configure proper CORS
- ✅ Use IAM roles (AWS)
- ✅ Rotate access keys regularly

### 4. Cost Management
- ✅ Set up S3 lifecycle policies
- ✅ Use appropriate storage classes
- ✅ Monitor storage usage
- ✅ Implement deletion on resource removal

---

## Troubleshooting

### Upload Fails with CORS Error

**Problem:** Browser blocks upload due to CORS

**Solution:**
1. Check CORS configuration in S3/Cloudinary
2. Add your domain to allowed origins
3. Include localhost for development

### Large File Upload Timeout

**Problem:** Upload times out for large files

**Solution:**
1. Increase Next.js body size limit:
```javascript
// next.config.js
experimental: {
  serverActions: {
    bodySizeLimit: '100mb'
  }
}
```

2. Use chunked uploads for very large files
3. Consider direct upload to storage provider

### Invalid File Type Error

**Problem:** Correct file type is rejected

**Solution:**
1. Check MIME type matches allowed types
2. Verify file extension
3. Update allowed types in `lib/upload.ts`

### Upload Works But File Not Accessible

**Problem:** File uploads but can't be accessed

**Solution for S3:**
1. Check bucket policy
2. Verify object ACL
3. Make object public or use signed URLs

**Solution for Cloudinary:**
1. Check upload preset settings
2. Verify resource type
3. Check folder permissions

---

## Performance Optimization

### Image Optimization

**Cloudinary** (automatic):
- Format conversion (WebP, AVIF)
- Quality optimization
- Responsive images
- Lazy loading

**S3** (manual):
- Use CloudFront CDN
- Enable gzip compression
- Set cache headers
- Consider image optimization service

### Video Optimization

**For best performance:**
1. Use adaptive bitrate streaming (HLS/DASH)
2. Generate multiple quality versions
3. Enable CDN delivery
4. Consider specialized platforms:
   - Mux
   - Vimeo
   - AWS MediaConvert

---

## Cost Estimation

### Cloudinary Free Tier
- 25 credits/month
- ~25GB storage
- ~25GB bandwidth
- Good for development

### AWS S3 Pricing (estimate)
- Storage: $0.023 per GB/month
- PUT requests: $0.005 per 1,000
- GET requests: $0.0004 per 1,000
- Data transfer: Free (first 100GB)

**Example:** 100 courses, 50GB total
- Storage: ~$1.15/month
- Requests: ~$0.50/month
- **Total: ~$1.65/month**

---

## Migration Between Providers

To switch from Cloudinary to S3 (or vice versa):

1. **Update environment variables**
2. **Run migration script** (create if needed)
3. **Update database URLs**
4. **Test uploads**
5. **Gradually migrate existing files**

---

## Monitoring and Logs

### Monitor These Metrics
- Upload success rate
- Average upload time
- Storage usage
- Bandwidth usage
- Error rates

### Logging
```typescript
// Add to upload endpoint
console.log('Upload started:', {
  userId: session.user.id,
  fileType: type,
  fileSize: file.size,
  folder,
});
```

---

## Quick Reference

### Environment Variables
```bash
# Choose one provider
UPLOAD_PROVIDER="cloudinary" # or "s3"

# Cloudinary
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_S3_BUCKET_NAME="xxx"
```

### Test Upload
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: next-auth.session-token=xxx" \
  -F "file=@test-image.jpg" \
  -F "type=image" \
  -F "folder=test"
```

---

## Support

### Official Documentation
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body-formdata)

### Troubleshooting
1. Check server logs
2. Verify environment variables
3. Test with curl
4. Check provider dashboard
5. Review CORS configuration

---

## Congratulations! 🎉

Your file upload system is configured and ready to use!
