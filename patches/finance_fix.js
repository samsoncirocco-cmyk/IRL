
/**
 * Auto-generated Patch
 * Target: Finance Integration
 * Action: Map 'fname' to 'first_name' to prevent drift.
 */
module.exports = function(payload) {
  if (payload.fname && !payload.first_name) {
    console.log("🛠  Patch Applied: Mapping 'fname' to 'first_name'");
    payload.first_name = payload.fname;
    delete payload.fname;
  }
  return payload;
};
    