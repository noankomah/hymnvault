// ─────────────────────────────────────────────
// IMPORT CORE FEATURES
// ─────────────────────────────────────────────

import { loadGenres } from './genre.js';

import {
  showInstruction,
  showInstructionIfAllClosed
} from './instruction.js';

import { startInstructionDemo } from './demo.js';

// ❗ MISSING IMPORTS (THIS IS YOUR BUG)
import { setupMenu, setupLanguageBar } from './allpops.js';
import { setupSearch } from './search.js';

// ─────────────────────────────────────────────
// BOOTSTRAP FLOW
// ─────────────────────────────────────────────

function initApp() {


  // 2. Load genre data
  loadGenres();


  // 4. Start demo AFTER DOM is stable
  requestAnimationFrame(() => {

    const overlay = document.getElementById('instructionOverlay');

    const instructionVisible =
      overlay && !overlay.classList.contains('hidden');

    if (instructionVisible) {
      startInstructionDemo();
    }

  });
}


// ─────────────────────────────────────────────
// SAFE START
// ─────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', initApp);