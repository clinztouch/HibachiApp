let trap = null;

export function trapFocus(modalElement) {
  const focusableElements = modalElement.querySelectorAll(
    'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
    '[tabindex="0"], [contenteditable]'
  );
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  function handleTrap(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    } else if (e.key === 'Escape') {
      modalElement.querySelector('#cancelEdit')?.click(); // Optional: close modal on Esc
    }
  }

  trap = handleTrap;
  document.addEventListener('keydown', handleTrap);

  first?.focus();
}

export function releaseFocusTrap() {
  if (trap) {
    document.removeEventListener('keydown', trap);
    trap = null;
  }
}

export function handleKeydown(e) {
  // Reserved for any global key handling if needed
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal.open');
    if (modal) {
      modal.querySelector('#cancelEdit')?.click(); // Close modal on Esc
    }
  }
}
