// == Exported Functions ====================================================

function roll(limit, trigger) {
  return Math.random() * limit > (trigger || (limit - 1));
}

// == Exports ===============================================================

module.exports = {
  roll: roll
}
