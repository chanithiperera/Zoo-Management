/**
 * Build absolute URLs for product images in JSON responses.
 * Static files are served at the same origin as the API (without `/api`).
 */

function requestOrigin(req) {
  const host = req.get('host');
  if (!host) return '';
  const proto = req.protocol || 'http';
  return `${proto}://${host}`.replace(/\/$/, '');
}

function isLoopbackHostname(hostname) {
  if (!hostname) return false;
  const h = String(hostname).toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1';
}

function normalizeProductImages(images) {
  if (images == null) return [];
  if (Array.isArray(images)) return images.filter((x) => x != null && String(x).trim());
  if (typeof images === 'string') {
    const t = images.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed.filter((x) => x != null && String(x).trim());
      } catch {
        /* treat as single path */
      }
    }
    return [t];
  }
  return [];
}

function absolutizeOne(stored, origin) {
  if (stored == null || typeof stored !== 'string') return stored;
  const s = stored.trim();
  if (!s || !origin) return s;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (isLoopbackHostname(u.hostname) && u.pathname.startsWith('/uploads')) {
        return `${origin}${u.pathname}${u.search || ''}`;
      }
    } catch {
      /* keep original */
    }
    return s;
  }

  const path = s.startsWith('/') ? s : `/${s}`;
  return `${origin}${path}`;
}

function productForJson(req, doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const origin = requestOrigin(req);
  o.images = normalizeProductImages(o.images).map((img) => absolutizeOne(String(img), origin));
  return o;
}

function productsForJson(req, docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map((d) => productForJson(req, d));
}

module.exports = { productForJson, productsForJson, requestOrigin };
