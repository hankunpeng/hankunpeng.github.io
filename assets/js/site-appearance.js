/** Appearance and reading fonts are independent of Chirpy's color mode. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'preferred-site-theme';
  var kaiFontStylesheet = new URL('../fonts/lxgw-wenkai-screen/font.css', document.currentScript.src).href;
  var memoryPreferences = Object.create(null);
  var themes = {
    paper: { label: 'Paper', fonts: ['garamond', 'lora', 'crimson'], fontKey: 'preferred-font' },
    cursor: { label: 'Cursor', fonts: ['sans', 'kai', 'serif'], fontKey: 'preferred-cursor-font' }
  };
  var configuredTheme = root.getAttribute('data-site-theme');
  var defaultTheme = Object.prototype.hasOwnProperty.call(themes, configuredTheme) ? configuredTheme : 'paper';

  function read(key) {
    if (Object.prototype.hasOwnProperty.call(memoryPreferences, key)) return memoryPreferences[key];
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function write(key, value) {
    memoryPreferences[key] = value;
    try { window.localStorage.setItem(key, value); } catch (error) { /* Preferences remain usable for this page. */ }
  }

  function getTheme() {
    var theme = root.getAttribute('data-site-theme');
    return Object.prototype.hasOwnProperty.call(themes, theme) ? theme : defaultTheme;
  }

  function getFont(theme) {
    var definition = themes[theme || getTheme()];
    var saved = read(definition.fontKey);
    return definition.fonts.indexOf(saved) !== -1 ? saved : definition.fonts[0];
  }

  function announce() {
    document.dispatchEvent(new CustomEvent('site-appearance-change'));
  }

  function loadReadingFont(theme, font) {
    if (theme !== 'cursor' || font !== 'kai' || document.getElementById('cursor-kai-font')) return;
    var stylesheet = document.createElement('link');
    stylesheet.id = 'cursor-kai-font';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = kaiFontStylesheet;
    document.head.appendChild(stylesheet);
  }

  function setTheme(theme, persist) {
    if (!Object.prototype.hasOwnProperty.call(themes, theme)) theme = defaultTheme;
    root.setAttribute('data-site-theme', theme);
    root.setAttribute('data-font', getFont(theme));
    loadReadingFont(theme, getFont(theme));
    if (persist !== false) write(THEME_KEY, theme);
    announce();
  }

  function setFont(font) {
    var definition = themes[getTheme()];
    if (definition.fonts.indexOf(font) === -1) return;
    root.setAttribute('data-font', font);
    loadReadingFont(getTheme(), font);
    write(definition.fontKey, font);
    announce();
  }

  window.SiteAppearance = { themes: themes, getTheme: getTheme, getFont: getFont, setTheme: setTheme, setFont: setFont };
  // Run in the head so the first paint already uses the saved appearance.
  setTheme(read(THEME_KEY) || defaultTheme, false);

  function initPicker() {
    var toggle = document.getElementById('site-theme-toggle');
    var label = document.querySelector('[data-current-site-theme]');
    var options = document.querySelectorAll('[data-site-theme-option]');

    function updatePicker() {
      var selected = getTheme();
      if (label) label.textContent = themes[selected].label;
      if (toggle) toggle.setAttribute('aria-label', '外观主题：' + themes[selected].label);
      options.forEach(function (button) {
        var active = button.getAttribute('data-site-theme-option') === selected;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    options.forEach(function (button) {
      button.addEventListener('click', function () {
        setTheme(button.getAttribute('data-site-theme-option'));
      });
    });
    document.addEventListener('site-appearance-change', updatePicker);
    updatePicker();
  }

  window.addEventListener('storage', function (event) {
    if (event.key === THEME_KEY || event.key === 'preferred-font' || event.key === 'preferred-cursor-font' || event.key === null) {
      if (event.key === null) memoryPreferences = Object.create(null);
      else delete memoryPreferences[event.key];
      setTheme(read(THEME_KEY) || defaultTheme, false);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPicker);
  else initPicker();
})();
