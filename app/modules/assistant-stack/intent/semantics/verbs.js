'use strict';

export const VERB_TERMS = {
  TAKEN_VERB: new Set(['genommen', 'eingenommen']),
  DRINK_VERB: new Set(['getrunken']),
  EAT_VERB: new Set(['gegessen']),
  LOG_VERB: new Set(['eintragen', 'eingetragen', 'ein']),
  START_VERB: new Set(['starte', 'start', 'starten']),
};

export default {
  VERB_TERMS,
};
