/**
 * Rule-Based Risk Engine for Basic (MVP) Version
 * 
 * Rules:
 * - Permissions <= 5  => Low Risk
 * - Permissions 6-10  => Medium Risk
 * - Permissions > 10  => High Risk
 */

function calculateRiskLevel(permissions = []) {
  const count = Array.isArray(permissions) ? permissions.length : 0;

  if (count <= 5) {
    return {
      level: 'Low',
      color: 'green',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Low privacy risk. The app requests a minimal set of permissions.'
    };
  }
  
  if (count <= 10) {
    return {
      level: 'Medium',
      color: 'yellow',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Moderate privacy risk. The app requests a typical set of permissions.'
    };
  }

  return {
    level: 'High',
    color: 'red',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'High privacy risk. The app requests extensive access to device features.'
  };
}

module.exports = {
  calculateRiskLevel
};
