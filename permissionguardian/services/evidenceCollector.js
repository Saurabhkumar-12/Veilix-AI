/**
 * evidenceCollector.js
 *
 * The backend is the SOLE source of facts before any AI call is made.
 *
 * This module collects everything the AI needs to reason with:
 *   - Official permission descriptions (from trusted permissionKnowledge DB)
 *   - App metadata (from scraper — name, category, description)
 *   - Verified features (extracted from app description via keyword matching)
 *   - Backend-owned sources (real, constructable URLs — never AI-generated)
 *
 * The AI receives this evidence bundle and reasons over it.
 * It does NOT discover evidence. It does NOT generate URLs.
 * It only answers: "Given this evidence, does this permission make sense?"
 */

const { getPermissionMeta, normalizePermissions, extractVerifiedFeatures } = require('../backend/risk-engine/permissionKnowledge');


// ─── Source Builder ───────────────────────────────────────────────────────────

/**
 * Builds backend-owned, real sources for a permission.
 * Only real, constructable URLs. No AI-generated URLs — ever.
 *
 * @param {string} permissionId - Normalized permission ID
 * @param {string|null} packageId - App package ID (null for APK uploads or demos)
 * @returns {Array<{title: string, url: string}>}
 */
function buildBackendSources(permissionId, packageId) {
  const sources = [
    {
      title: 'Android Permissions Reference',
      url: `https://developer.android.com/reference/android/Manifest.permission#${permissionId}`
    }
  ];

  // Add Play Store link only for real, verifiable package IDs
  const isRealPackage =
    packageId &&
    typeof packageId === 'string' &&
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(packageId) &&
    !packageId.startsWith('demo.') &&
    !packageId.startsWith('http');

  if (isRealPackage) {
    sources.push({
      title: 'Official App Listing — Google Play Store',
      url: `https://play.google.com/store/apps/details?id=${packageId}`
    });
  }

  return sources;
}

// ─── Main Evidence Collector ──────────────────────────────────────────────────

/**
 * Collects all verifiable evidence for every permission in the given app.
 * This is the sole source of facts passed to the AI.
 *
 * Structure:
 *   app_context   → App metadata (name, category, description)
 *   permissions[] → Per-permission evidence bundles
 *     permission_id         → Normalized permission ID
 *     official_description  → From trusted knowledge base (FACT)
 *     what_it_does          → Human-readable description (FACT, from KB)
 *     sensitivity           → From trusted knowledge base (FACT)
 *     typical_categories    → From trusted knowledge base (FACT)
 *     potential_abuse       → From trusted knowledge base (FACT)
 *     verified_features     → Explicit keyword matches in description (FACT)
 *     sources               → Backend-constructed real URLs only (FACT)
 *
 * @param {object} appDetails - Full app metadata from scraper
 * @returns {{ app_context: object, permissions: Array }}
 */
function collectEvidence(appDetails) {
  const {
    name, description, category, packageId,
    permissions = [], installs, rating, developer
  } = appDetails;

  const descriptionExcerpt = (description || '').slice(0, 600).trim();

  const permissionEvidence = (permissions || []).map(rawPerm => {
    const permId = normalizePermissions(rawPerm);
    if (!permId) return null;

    const meta = getPermissionMeta(permId);

    // FACT: From trusted permission knowledge base
    const official_description = meta.description ||
      `Allows the app to use ${permId.replace(/_/g, ' ').toLowerCase()}.`;

    // FACT: From keyword matching on app description
    const verified_features = extractVerifiedFeatures(permId, description);

    // FACT: Backend-constructed real URLs
    const sources = buildBackendSources(permId, packageId);

    return {
      permission_id:       permId,
      official_description,                     // Factual: what this permission technically allows
      what_it_does:        official_description, // Same fact, alias for clearer AI prompt
      sensitivity:         meta.sensitivity || 'MEDIUM',
      typical_categories:  meta.typicalCategories || [],
      potential_abuse:     meta.potentialAbuse || '',
      verified_features,                         // Only features proven by description keywords
      sources,                                   // Backend-owned, real URLs only
    };
  }).filter(Boolean);

  return {
    app_context: {
      name:                name || 'Unknown App',
      category:            category || 'Unknown',
      developer:           developer || 'Unknown',
      installs:            installs || 'Unknown',
      rating:              rating != null ? rating : 'Unknown',
      description_excerpt: descriptionExcerpt || 'No description available.',
    },
    permissions: permissionEvidence,
  };
}

module.exports = { collectEvidence, extractVerifiedFeatures, buildBackendSources };
