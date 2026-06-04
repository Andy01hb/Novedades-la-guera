import 'server-only'
import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

function createRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ratelimit] UPSTASH_REDIS_REST_URL / TOKEN no configurados — rate limiting DESACTIVADO')
    }
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const redis = createRedis()

function makeRatelimit(requests: number, window: Duration, prefix: string): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window), prefix })
}

export const limiters = {
  login:    makeRatelimit(10, '15 m', 'rl:login'),
  register: makeRatelimit(5,  '1 h',  'rl:register'),
  maps:     makeRatelimit(60, '1 m',  'rl:maps'),
  shipping: makeRatelimit(20, '1 m',  'rl:shipping'),
  checkout: makeRatelimit(5,  '1 h',  'rl:checkout'),
}

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  )
}

export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<NextResponse | null> {
  if (!limiter) return null
  const { success } = await limiter.limit(identifier)
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.' },
      { status: 429 },
    )
  }
  return null
}
