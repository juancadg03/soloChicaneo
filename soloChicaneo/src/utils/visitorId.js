/**
 * Generate or retrieve a unique visitor ID stored in localStorage
 * @returns {string} Unique visitor identifier
 */
export function getOrCreateVisitorId() {
  const VISITOR_ID_KEY = "soloChicaneo_visitorId";
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    // Generate a unique ID using timestamp and random number
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}
