describe('Weather App basic initialization', () => {
  beforeEach(() => {
    // Reset modules and DOM between tests
    jest.resetModules();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('unit toggle shows °F when preference is fahrenheit', () => {
    // Prepare DOM and localStorage before loading app script
    document.body.innerHTML = '<button id="unitToggle"></button>';
    localStorage.setItem('weatherApp.tempUnit', 'fahrenheit');

    // Load the app script (runs init functions at top-level)
    require('../docs/js/index.js');

    const btn = document.getElementById('unitToggle');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('°F');
  });

  test('body gets theme--dark when preference is dark', () => {
    localStorage.setItem('weatherApp.themePreference', 'dark');

    // Load the app script
    require('../docs/js/index.js');

    expect(document.body.classList.contains('theme--dark')).toBe(true);
  });
});
