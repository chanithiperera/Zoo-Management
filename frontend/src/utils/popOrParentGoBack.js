/**
 * Matches {@link popOrParentGoBack}: true when this navigator or its parent can pop.
 * Keeps drawer shortcuts + header back visibility aligned with actual go-back behaviour.
 */
export function popOrParentCanGoBack(navigation) {
  if (!navigation) return false;
  if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) return true;
  const parent = typeof navigation.getParent === 'function' ? navigation.getParent() : null;
  return !!(parent && typeof parent.canGoBack === 'function' && parent.canGoBack());
}

/**
 * When a screen is the only route in a nested stack, navigation.goBack() does nothing.
 * Pop that stack’s parent (e.g. return from Store or Events to Profile) instead.
 */
export function popOrParentGoBack(navigation) {
  if (!navigation) return false;
  if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
    navigation.goBack();
    return true;
  }
  const parent = typeof navigation.getParent === 'function' ? navigation.getParent() : null;
  if (parent && typeof parent.canGoBack === 'function' && parent.canGoBack()) {
    parent.goBack();
    return true;
  }
  return false;
}
