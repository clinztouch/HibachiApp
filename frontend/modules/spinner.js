// spinner.js
export function showSpinner() {
    document.getElementById('spinner')?.classList.remove('hidden');
  }
  
  export function hideSpinner() {
    document.getElementById('spinner')?.classList.add('hidden');
  }
  