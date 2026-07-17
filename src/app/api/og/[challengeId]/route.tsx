import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const { challengeId } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { participations: true } },
      },
    });

    if (!challenge) {
      return new ImageResponse(
        (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#f3f4f6',
            fontFamily: 'system-ui, sans-serif',
          }}>
            <h1 style={{ fontSize: 48, color: '#666' }}>NEWSY</h1>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const participants = challenge._count.participations;

    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: 60,
          fontFamily: 'system-ui, sans-serif',
          color: 'white',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#FF385C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 900,
              }}>
                N
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, opacity: 0.9 }}>NEWSY</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{
              fontSize: 52,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 900,
            }}>
              {challenge.title}
            </h1>
            <p style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              lineHeight: 1.4,
            }}>
              от {challenge.organizer.name} · {participants} участников
            </p>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: 24,
              fontSize: 18,
              color: 'rgba(255,255,255,0.5)',
            }}>
              <span>{challenge.format || 'ONLINE'}</span>
              {challenge.endDate && (
                <span>до {new Date(challenge.endDate).toLocaleDateString('ru-RU')}</span>
              )}
            </div>
            <div style={{
              padding: '12px 24px',
              background: '#FF385C',
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 800,
            }}>
              Участвовать
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('[og] Error:', error);
    return new Response('Internal error', { status: 500 });
  }
}
