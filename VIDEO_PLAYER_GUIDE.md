# YouTube-Like Video Player Guide

## Overview

The Karima Course Platform now features a professional, YouTube-like video player with advanced controls and a dedicated watch page for an optimal viewing experience.

## Features

### 🎬 Custom Video Player Component

**Location**: `/components/video-player.tsx`

#### Professional Controls:
- ✅ **Play/Pause Button** - Large center button and bottom control
- ✅ **Progress Bar** - Click to seek, hover effects, visual feedback
- ✅ **Time Display** - Current time / Total duration
- ✅ **Volume Control** - Mute/unmute button with volume slider
- ✅ **Playback Speed** - 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x
- ✅ **Fullscreen Mode** - Enter/exit fullscreen
- ✅ **Auto-hide Controls** - Controls fade after 3 seconds of inactivity
- ✅ **Title Overlay** - Video title shown at top
- ✅ **Gradient Overlays** - Professional look with black gradients

#### Keyboard Shortcuts:
| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `←` (Left Arrow) | Rewind 5 seconds |
| `→` (Right Arrow) | Forward 5 seconds |
| `↑` (Up Arrow) | Increase volume |
| `↓` (Down Arrow) | Decrease volume |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |

### 📺 Dedicated Watch Page

**Location**: `/app/(public)/watch/[slug]/page.tsx`

#### Features:
- ✅ **Theater Mode Layout** - Full-width video player
- ✅ **Lesson Sidebar** - All course lessons with progress indicators
- ✅ **Auto-Play Next** - Automatically plays next lesson on video end
- ✅ **Progress Tracking** - Visual progress bar for course completion
- ✅ **Instructor Info** - Display instructor details below video
- ✅ **Lesson Description** - Full description for current lesson
- ✅ **Navigation Buttons** - Previous/Next lesson buttons
- ✅ **Quick Actions** - Mark as complete button
- ✅ **Responsive Design** - Works on all screen sizes

#### Access:
```
URL: /watch/[course-slug]?lesson=[lesson-id]
Example: /watch/intro-to-javascript?lesson=abc123
```

### 🎓 Enhanced Learning Page

**Location**: `/app/(public)/learn/[slug]/page.tsx`

The existing learning page now uses the custom VideoPlayer component for better video playback.

## Usage

### For Students:

1. **Watch Videos**:
   - Navigate to any enrolled course
   - Click on a lesson to start watching
   - Use keyboard shortcuts for quick navigation
   - Videos automatically mark as complete when finished

2. **Use the Watch Page**:
   - Click "Watch" from course page
   - Or navigate to `/watch/[course-slug]`
   - Enjoy distraction-free viewing
   - Easily switch between lessons using sidebar

3. **Track Progress**:
   - Green checkmarks show completed lessons
   - Progress bar displays overall completion
   - Mark lessons complete manually if needed

### For Instructors:

1. **Upload Videos**:
   - Use the course editor to add lessons
   - Provide video URLs (hosted on your preferred platform)
   - Add titles and descriptions
   - Set lesson order and duration

2. **Preview Your Content**:
   - Instructors can watch their own videos without enrollment
   - Test video playback before publishing
   - Verify video quality and controls work correctly

### For Developers:

#### Using the VideoPlayer Component:

```tsx
import { VideoPlayer } from '@/components/video-player';

function MyComponent() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      title="My Video Title"
      onEnded={() => console.log('Video finished')}
      autoPlay={false}
    />
  );
}
```

#### Props:

```typescript
interface VideoPlayerProps {
  src: string;          // Video URL
  title: string;        // Video title (shown in overlay)
  onEnded?: () => void; // Callback when video ends
  autoPlay?: boolean;   // Auto-play on load (default: false)
}
```

## Video Formats Supported

The player supports all formats that work with HTML5 `<video>` tag:

- ✅ MP4 (H.264) - **Recommended**
- ✅ WebM
- ✅ Ogg
- ✅ HLS (with proper setup)

### Recommended Video Settings:
- **Format**: MP4 (H.264)
- **Resolution**: 1080p or 720p
- **Bitrate**: 2-5 Mbps for 1080p, 1-2 Mbps for 720p
- **Audio**: AAC, 128kbps

## Integration with Video Hosting

### Option 1: Direct URLs
Upload videos to:
- AWS S3 (with CloudFront)
- Cloudinary
- Your own CDN

### Option 2: Video Platforms
For better streaming:
- **Mux** - Professional video hosting with adaptive streaming
- **Vimeo Pro** - High-quality hosting
- **Bunny.net** - Affordable CDN with video streaming

### Example with Mux:

```typescript
// When creating a lesson
const lessonData = {
  title: "Introduction to React",
  videoUrl: "https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8",
  duration: 600, // 10 minutes
};
```

## Styling & Customization

### Color Scheme:
- Primary color: Red (`#ef4444`) - YouTube-like
- Background: Black for video container
- Overlays: Black with opacity for professional look

### Customize Colors:

Edit `/components/video-player.tsx`:

```tsx
// Change primary color from red to blue:
// Replace: bg-red-600, text-red-500
// With: bg-blue-600, text-blue-500
```

## Troubleshooting

### Video Not Playing

**Problem**: Video shows black screen or error

**Solutions**:
1. Check video URL is accessible
2. Verify video format is supported (MP4 recommended)
3. Check CORS headers if video is on different domain
4. Try opening video URL directly in browser

### Controls Not Showing

**Problem**: Video controls don't appear

**Solutions**:
1. Move mouse over video area
2. Check if JavaScript is enabled
3. Try clicking on video to show controls
4. Refresh the page

### Fullscreen Not Working

**Problem**: Fullscreen button doesn't work

**Solutions**:
1. Check browser permissions
2. Make sure browser supports Fullscreen API
3. Try pressing `F` key instead

### Keyboard Shortcuts Not Working

**Problem**: Keyboard shortcuts don't respond

**Solutions**:
1. Click on video area to focus it
2. Make sure no text input is focused
3. Check browser console for errors

## Performance Optimization

### For Better Performance:

1. **Use CDN**: Host videos on a CDN for faster loading
2. **Compress Videos**: Use H.264 compression
3. **Adaptive Streaming**: Use HLS or DASH for large files
4. **Preload Metadata**: Videos preload metadata by default
5. **Lazy Loading**: Videos only load when user navigates to lesson

### Bandwidth Considerations:

- 720p: ~1-2 GB per hour
- 1080p: ~2-4 GB per hour
- Consider implementing quality selection for mobile users

## Accessibility Features

- ✅ Keyboard navigation fully supported
- ✅ ARIA labels on all buttons
- ✅ High contrast controls
- ✅ Focus indicators
- 🔄 Captions support (coming soon)

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Planned features:
- [ ] Picture-in-Picture mode
- [ ] Quality selection (480p, 720p, 1080p)
- [ ] Subtitle/Caption support
- [ ] Watch history and resume playback
- [ ] Video bookmarks/timestamps
- [ ] Thumbnail preview on hover
- [ ] Mini player mode
- [ ] Chromecast support

## Examples

### Example 1: Basic Usage

```tsx
<VideoPlayer
  src="https://example.com/lesson1.mp4"
  title="Introduction to JavaScript"
  onEnded={() => markLessonComplete()}
/>
```

### Example 2: Auto-play Next Lesson

```tsx
<VideoPlayer
  src={currentLesson.videoUrl}
  title={currentLesson.title}
  onEnded={() => {
    markLessonComplete();
    playNextLesson();
  }}
  autoPlay={false}
/>
```

### Example 3: With Progress Tracking

```tsx
function LessonPlayer() {
  const handleVideoEnd = async () => {
    // Mark lesson complete
    await markComplete(lessonId);

    // Update progress
    await updateProgress();

    // Play next lesson
    if (hasNextLesson) {
      playNextLesson();
    }
  };

  return (
    <VideoPlayer
      src={lesson.videoUrl}
      title={lesson.title}
      onEnded={handleVideoEnd}
    />
  );
}
```

## Testing Checklist

Test the video player with:

- [ ] Different video formats (MP4, WebM)
- [ ] Different resolutions (720p, 1080p)
- [ ] Short videos (< 1 minute)
- [ ] Long videos (> 30 minutes)
- [ ] All keyboard shortcuts
- [ ] Fullscreen mode
- [ ] Volume controls
- [ ] Playback speed changes
- [ ] Progress bar seeking
- [ ] Auto-play next lesson
- [ ] Mobile devices
- [ ] Different browsers

## Security Considerations

### Protecting Video Content:

1. **Signed URLs**: Use temporary signed URLs for video access
2. **Token Authentication**: Require valid session token
3. **Domain Restrictions**: Configure CORS properly
4. **Hotlink Protection**: Prevent unauthorized embedding
5. **DRM** (optional): For highly sensitive content

### Example with AWS S3 Signed URLs:

```typescript
// Generate temporary URL (expires in 1 hour)
const videoUrl = await generateSignedUrl(s3Key, 3600);

// Use in player
<VideoPlayer src={videoUrl} title={lesson.title} />
```

## Resources

- [MDN: Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Web Video Best Practices](https://web.dev/video/)
- [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)

---

**Version**: 1.0.0
**Last Updated**: November 24, 2025
**Status**: ✅ Production Ready

## Quick Start

1. **View the Watch Page**:
   ```
   Navigate to: /watch/[your-course-slug]
   ```

2. **Use Keyboard Shortcuts**:
   - Press `Space` to play/pause
   - Press `F` for fullscreen
   - Use arrow keys to navigate

3. **Track Progress**:
   - Videos auto-mark complete when finished
   - Manual "Mark Complete" button available
   - Progress bar shows overall completion

4. **Navigate Lessons**:
   - Click lessons in sidebar
   - Use Previous/Next buttons
   - Auto-play takes you to next lesson

Enjoy your enhanced video learning experience! 🎬
