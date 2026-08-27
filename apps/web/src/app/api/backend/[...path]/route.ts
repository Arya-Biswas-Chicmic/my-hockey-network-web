import { NextRequest, NextResponse } from 'next/server';

import { getServerEnvironment } from '@/infrastructure/server/environment';
import { rewriteSetCookieForSameOrigin } from '@/infrastructure/server/proxy-cookie';

export const dynamic = 'force-dynamic';

const REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
  'cookie',
  'if-match',
  'if-none-match',
  'x-client-type',
  'x-csrf-token',
  'x-request-id',
] as const;

const RESPONSE_HEADERS = [
  'cache-control',
  'content-disposition',
  'content-language',
  'content-type',
  'etag',
  'last-modified',
  'retry-after',
  'vary',
  'x-request-id',
] as const;

function createBackendHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { apiBaseUrl } = getServerEnvironment();
  const { path } = await context.params;
  const backendUrl = new URL(`${apiBaseUrl}/${path.map(encodeURIComponent).join('/')}`);
  backendUrl.search = request.nextUrl.search;

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: createBackendHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  const headers = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  for (const cookie of response.headers.getSetCookie()) {
    headers.append('set-cookie', rewriteSetCookieForSameOrigin(cookie));
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
