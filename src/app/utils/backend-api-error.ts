import { HttpErrorResponse } from '@angular/common/http';

function extractFromBody(body: Record<string, unknown>): string | null {
  const errors = body['errors'];
  if (Array.isArray(errors) && errors.length > 0) {
    const details = errors.map((e) => String(e)).filter(Boolean).join('. ');
    if (details) {
      return details;
    }
  }
  const message = body['message'];
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }
  const errorField = body['error'];
  if (typeof errorField === 'string' && errorField.trim()) {
    return errorField.trim();
  }
  return null;
}

export function getBackendErrorMessage(err: unknown): string | null {
  if (!(err instanceof HttpErrorResponse)) {
    return null;
  }
  const body = err.error;
  if (body == null) {
    return null;
  }
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      return extractFromBody(parsed);
    } catch {
      const t = body.trim();
      return t || null;
    }
  }
  if (typeof body === 'object') {
    return extractFromBody(body as Record<string, unknown>);
  }
  return null;
}

export function isFirebaseAuthError(err: unknown): err is { code: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string' &&
    (err as { code: string }).code.startsWith('auth/')
  );
}
