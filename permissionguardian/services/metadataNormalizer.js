/**
 * services/metadataNormalizer.js
 *
 * Canonical Application Metadata Normalizer for Veilix AI.
 * Ensures strict schema validation, predictable array structures,
 * and clear mapping of missing vs. empty collections.
 */

const { z } = require('zod');

// Schema for canonical ApplicationMetadata
const applicationMetadataSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Application name must not be empty"),
  packageName: z.string().trim().default(""),
  developer: z.string().trim().default("Android Application"),
  version: z.string().trim().default("1.0.0"),
  description: z.string().trim().default(""),
  platform: z.string().trim().default("Android"),
  permissions: z.array(z.string().trim()).default([]),
  features: z.array(z.object({
    name: z.string().trim(),
    type: z.string().trim().optional(),
    verified: z.boolean().default(false)
  })).default([]),
  categories: z.array(z.string().trim()).default([]),
  evidence: z.array(z.object({
    type: z.string().trim(),
    description: z.string().trim(),
    verified: z.boolean().default(false)
  })).default([]),
  source: z.string().trim().default("Unknown"),
  sourceUrl: z.string().trim().default(""),
  verified: z.boolean().default(false),
  metadataStatus: z.enum(["verified", "unverified", "insufficient_evidence"]).default("unverified"),
  permissionsStatus: z.enum(["verified_empty", "available", "unavailable", "malformed"]).default("unavailable"),
  rating: z.number().default(4.2),
  installs: z.string().trim().default("100K+"),
  icon: z.string().trim().default(""),
  summary: z.string().trim().optional(),
});

/**
 * Validates and normalizes raw application metadata into the canonical schema.
 *
 * @param {object} raw - The raw metadata object from a scraper, user form, or APK.
 * @returns {object} Canonical ApplicationMetadata object.
 */
function normalizeApplicationMetadata(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error("Invalid raw application metadata input");
  }

  // Pre-process permissions to detect availability status
  let permissionsStatus = "unavailable";
  let permissionsArray = [];

  if ('permissions' in raw) {
    const rawPerms = raw.permissions;
    if (rawPerms === null || rawPerms === undefined) {
      permissionsStatus = "unavailable";
      permissionsArray = [];
    } else if (Array.isArray(rawPerms)) {
      permissionsStatus = rawPerms.length === 0 ? "verified_empty" : "available";
      permissionsArray = rawPerms;
    } else {
      permissionsStatus = "malformed";
      permissionsArray = [];
    }
  }

  // Set default metadataStatus based on permissionsStatus
  let metadataStatus = "unverified";
  if (raw.metadataStatus) {
    metadataStatus = raw.metadataStatus;
  } else {
    if (permissionsStatus === "available" || permissionsStatus === "verified_empty") {
      metadataStatus = "verified";
    } else {
      metadataStatus = "unverified";
    }
  }

  // Safe fallback categories mapping
  let categories = [];
  if (Array.isArray(raw.categories)) {
    categories = raw.categories;
  } else if (raw.category) {
    categories = [raw.category];
  }

  const preProcessed = {
    id: raw.id || raw.packageId || raw.historyId || raw.appId || "unknown_id",
    name: typeof raw.name === 'string' ? raw.name : (typeof raw.title === 'string' ? raw.title : ""),
    packageName: raw.packageName || raw.packageId || raw.appId || raw.historyId || "",
    developer: raw.developer || "Android Application",
    version: raw.version || "1.0.0",
    description: raw.description || raw.summary || "",
    platform: raw.platform || "Android",
    permissions: permissionsArray,
    features: raw.features || [],
    categories,
    evidence: raw.evidence || [],
    source: raw.source || (raw.demo ? "Demo dataset" : "Unknown"),
    sourceUrl: raw.sourceUrl || raw.url || "",
    verified: raw.verified || false,
    metadataStatus,
    permissionsStatus,
    rating: typeof raw.rating === 'number' ? raw.rating : (typeof raw.score === 'number' ? raw.score : 4.2),
    installs: raw.installs || "100K+",
    icon: raw.icon || "",
    summary: raw.summary || raw.shortDescription || "",
  };

  // Perform validation using Zod
  const result = applicationMetadataSchema.safeParse(preProcessed);
  if (!result.success) {
    const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Canonical metadata schema validation failed: ${message}`);
  }

  return result.data;
}

module.exports = {
  normalizeApplicationMetadata,
  applicationMetadataSchema
};
