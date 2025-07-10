// utils.js

export async function withSpinner(asyncFn) {
    const spinner = document.getElementById('spinner');
    if (!spinner) {
      console.warn('Spinner element not found');
      return asyncFn();
    }
  
    spinner.style.display = 'block';
    try {
      return await asyncFn();
    } catch (error) {
      console.error('Error during spinner-wrapped function:', error);
      throw error;
    } finally {
      spinner.style.display = 'none';
    }
  }
  