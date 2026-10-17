/**
 * ==========================================================================
 * Weather Planner - Theme Manager (js/theme.js)
 * Manages Light / Dark mode toggle and state persistence in localStorage
 * ==========================================================================
 */

(function () {
  'use strict';

  var THEME_KEY = 'wp_theme';
  var THEME_DARK = 'dark';
  var THEME_LIGHT = 'light';

  var ThemeManager = {
    init: function () {
      this.themeToggleBtn = document.getElementById('theme-toggle-btn');
      this.themeIcon = document.getElementById('theme-icon');

      var currentTheme = this.getSavedTheme();
      this.applyTheme(currentTheme);

      if (this.themeToggleBtn) {
        this.themeToggleBtn.addEventListener('click', this.toggleTheme.bind(this));
      }
    },

    getSavedTheme: function () {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === THEME_DARK || saved === THEME_LIGHT) {
        return saved;
      }
      // Mặc định kiểm tra hệ điều hành người dùng nếu chưa lưu
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEME_DARK;
      }
      return THEME_LIGHT;
    },

    applyTheme: function (theme) {
      if (theme === THEME_DARK) {
        document.documentElement.setAttribute('data-theme', THEME_DARK);
        if (this.themeIcon) {
          this.themeIcon.textContent = '☀️';
        }
        if (this.themeToggleBtn) {
          this.themeToggleBtn.setAttribute('aria-label', 'Chuyển sang giao diện Sáng');
          this.themeToggleBtn.setAttribute('title', 'Chuyển sang giao diện Sáng');
        }
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (this.themeIcon) {
          this.themeIcon.textContent = '🌙';
        }
        if (this.themeToggleBtn) {
          this.themeToggleBtn.setAttribute('aria-label', 'Chuyển sang giao diện Tối');
          this.themeToggleBtn.setAttribute('title', 'Chuyển sang giao diện Tối');
        }
      }
    },

    toggleTheme: function () {
      var isDark = document.documentElement.getAttribute('data-theme') === THEME_DARK;
      var newTheme = isDark ? THEME_LIGHT : THEME_DARK;

      this.applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    }
  };

  window.ThemeManager = ThemeManager;

  // Khởi tạo ngay khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ThemeManager.init();
    });
  } else {
    ThemeManager.init();
  }
})();
