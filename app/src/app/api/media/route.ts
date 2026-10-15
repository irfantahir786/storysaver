import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview API Proxy Route
 * This route fetches media from external CDNs (like Instagram) on the server-side
 * to bypass browser CORS restrictions during downloads.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing media URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Remote server responded with ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Media proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
