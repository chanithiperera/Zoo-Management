/**
 * Simple middleware to support _method override in POST body.
 * Useful for mobile environments where DELETE/PATCH might be blocked.
 */
const methodOverride = (req, res, next) => {
  if (req.method === 'POST' && req.body && typeof req.body === 'object' && req.body._method) {
    const method = req.body._method.toUpperCase();
    console.log(`[MethodOverride] Overriding POST ${req.url} to ${method}`);
    if (['DELETE', 'PATCH', 'PUT'].includes(method)) {
      req.method = method;
      // Remove it from body so it doesn't interfere with validations
      delete req.body._method;
    }
  }
  next();
};

module.exports = methodOverride;
