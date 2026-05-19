# Video Benchmark Intelligence App
# Deployment Configuration

## Quick Start (Development)

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to test locally.

## Deploy to Vercel (Recommended for Live Deployment)

1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import the GitHub repository
4. Vercel will auto-detect Next.js and configure build settings
5. Click Deploy
6. Your app will be live at `https://your-project.vercel.app`

Set `YOUTUBE_API_KEY` in your deployment environment to enable structured YouTube Data API v3 extraction. Without it, the app still works using public channel discovery and fallback scraping.

## Deploy to Other Platforms

### Node.js / Railway / Render

```bash
npm run build
npm run start
```

The app requires Node.js 18+.

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t video-benchmark .
docker run -p 3000:3000 video-benchmark
```

## How It Works

1. **Discovery**: Uses YouTube Data API v3 when available, otherwise public channel patterns and fallback discovery
2. **Scraping**: Extracts subscriber counts, channel creation dates, upload playlists, and recent video metadata from API-backed endpoints
3. **Analysis**: Calculates engagement rates, posting cadence, upload frequency, content themes, inactive periods, and comparative scoring
4. **Report**: Renders web preview with interactive charts and generates a 10+ slide branded PowerPoint deck
5. **Export**: Downloads PPTX suitable for client presentation

## Architecture

- **Frontend**: Next.js React components with Recharts for data visualization
- **Backend**: Next.js API routes handle discovery, scraping, analysis, and PPTX generation
- **Libraries**:
  - `axios` for direct YouTube Data API requests
  - `axios` + `cheerio` for fallback web scraping
  - `pptxgenjs` for PowerPoint generation
  - `recharts` for interactive charts
  - `zod` for input validation

## Limitations & Notes

- Video-level metrics are inferred only if API extraction is unavailable
- The app gracefully handles missing or partial public data
- Search results depend on public YouTube page structure (may vary)
- Maximum 4 competitors per analysis
- No login required; all processing uses public data

## Quality Assurance

- TypeScript strict mode enabled
- ESLint configured
- All API routes include input validation
- Graceful error handling throughout
- Responsive UI for desktop and tablet

## Support

For issues or improvements, please refer to the README.md in the root directory.
