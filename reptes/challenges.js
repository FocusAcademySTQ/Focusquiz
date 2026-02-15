// ===== Menú de reptes (canvi de joc) =====
    (() => {
      const chips = Array.from(document.querySelectorAll('.challenge-chip[data-challenge]'));
      const panels = Array.from(document.querySelectorAll('[data-challenge-panel]'));
      if (!chips.length || !panels.length) return;
      const activate = (id) => {
        chips.forEach((chip) => chip.setAttribute('aria-current', chip.dataset.challenge === id ? 'true' : 'false'));
        panels.forEach((panel) => { panel.hidden = panel.dataset.challengePanel !== id; });
      };
      chips.forEach((chip) => chip.addEventListener('click', () => activate(chip.dataset.challenge || 'tug')));
      activate('tug');
    })();
