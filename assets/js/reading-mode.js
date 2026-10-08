/**
 * Adaptive Reading Mode & Drawer Controller
 * Handles keyboard shortcuts:
 *   [ -> Toggle Left Sidebar
 *   ] -> Toggle Right Panel
 *   \ -> Toggle Article Table of Contents (TOC) Modal
 *   Esc -> Close TOC modal or mobile drawers
 */
(function () {
  function initReadingMode() {
    var body = document.body;
    var isPost = body.classList.contains('layout-post') || body.getAttribute('data-layout') === 'post';
    var layoutBtn = document.getElementById('layout-toggle');
    var sidebarTrigger = document.getElementById('sidebar-trigger');
    var panelTrigger = document.getElementById('panel-trigger');
    var mask = document.getElementById('mask');
    var popup = document.getElementById('toc-popup');
    var popupContent = document.getElementById('toc-popup-content');
    var popupClose = document.getElementById('toc-popup-close');

    // 1. Initialize Body Attributes if not already present
    if (!body.hasAttribute('data-sidebar')) {
      body.setAttribute('data-sidebar', isPost ? 'closed' : 'open');
    }
    if (!body.hasAttribute('data-panel')) {
      body.setAttribute('data-panel', isPost ? 'closed' : 'open');
    }

    function updateButtons() {
      var sidebarState = body.getAttribute('data-sidebar');
      var panelState = body.getAttribute('data-panel');

      if (sidebarTrigger) {
        var sbOpen = sidebarState === 'open';
        sidebarTrigger.title = sbOpen ? '收起左侧栏，按 [ 键' : '呼出左侧栏，按 [ 键';
        sidebarTrigger.setAttribute('aria-label', sidebarTrigger.title);
        sidebarTrigger.classList.toggle('active', sbOpen);
      }

      if (panelTrigger) {
        var pnOpen = panelState === 'open';
        panelTrigger.title = pnOpen ? '收起右侧栏，按 ] 键' : '呼出右侧栏，按 ] 键';
        panelTrigger.setAttribute('aria-label', panelTrigger.title);
        panelTrigger.classList.toggle('active', pnOpen);
      }

      if (layoutBtn) {
        var bothClosed = sidebarState === 'closed' && panelState === 'closed';
        layoutBtn.title = bothClosed ? '展开两侧栏，三栏全貌，按 = 键' : '收起两侧栏，专注阅读，按 = 键';
        layoutBtn.setAttribute('aria-label', layoutBtn.title);
        layoutBtn.classList.toggle('active', bothClosed);
      }
    }

    updateButtons();

    // 2. Toggle Left Sidebar
    function toggleLeft() {
      var current = body.getAttribute('data-sidebar') || 'closed';
      var next = current === 'open' ? 'closed' : 'open';
      body.setAttribute('data-sidebar', next);

      if (window.innerWidth < 992) {
        if (next === 'open') {
          body.setAttribute('sidebar-display', '');
          if (mask) mask.classList.remove('d-none');
        } else {
          body.removeAttribute('sidebar-display');
          if (mask && body.getAttribute('data-panel') !== 'open') {
            mask.classList.add('d-none');
          }
        }
      }
      updateButtons();
    }

    // 3. Toggle Right Panel
    function toggleRight() {
      var current = body.getAttribute('data-panel') || 'closed';
      var next = current === 'open' ? 'closed' : 'open';
      body.setAttribute('data-panel', next);

      if (window.innerWidth < 992) {
        if (next === 'open') {
          body.setAttribute('panel-display', '');
          if (mask) mask.classList.remove('d-none');
        } else {
          body.removeAttribute('panel-display');
          if (mask && body.getAttribute('data-sidebar') !== 'open') {
            mask.classList.add('d-none');
          }
        }
      }
      updateButtons();
    }

    // 4. Toggle Article TOC Modal
    function toggleTocModal() {
      if (!popup) return;
      if (popup.open) {
        popup.close();
        return;
      }

      if (popupContent) {
        var tocNav = document.getElementById('toc');
        if (tocNav && tocNav.innerHTML.trim().length > 0) {
          popupContent.innerHTML = tocNav.innerHTML;
        } else {
          var headings = document.querySelectorAll('main article h2, main article h3, main article h4');
          if (headings.length > 0) {
            var ul = document.createElement('ul');
            ul.className = 'toc-dynamic-list';
            headings.forEach(function (h, idx) {
              if (!h.id) {
                h.id = 'heading-' + idx;
              }
              var li = document.createElement('li');
              li.className = 'toc-item toc-' + h.tagName.toLowerCase();
              var a = document.createElement('a');
              a.href = '#' + h.id;
              a.textContent = h.textContent.replace(/^[#\s]+/, '').trim();
              li.appendChild(a);
              ul.appendChild(li);
            });
            popupContent.innerHTML = '';
            popupContent.appendChild(ul);
          } else {
            popupContent.innerHTML = '<div class="toc-empty-notice"><i class="fa-solid fa-circle-info me-2"></i>本文为全篇连贯随笔，未设置二级/三级标题目录</div>';
          }
        }

        popupContent.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            popup.close();
          });
        });
      }

      if (typeof popup.showModal === 'function') {
        popup.showModal();
      } else {
        popup.setAttribute('open', '');
      }
    }

    // 5. Layout Toggle Button (Reading Mode)
    function toggleReadingMode() {
      var sidebarState = body.getAttribute('data-sidebar');
      var panelState = body.getAttribute('data-panel');
      if (sidebarState === 'closed' && panelState === 'closed') {
        body.setAttribute('data-sidebar', 'open');
        body.setAttribute('data-panel', 'open');
      } else {
        body.setAttribute('data-sidebar', 'closed');
        body.setAttribute('data-panel', 'closed');
      }
      updateButtons();
    }

    if (layoutBtn) {
      layoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleReadingMode();
      });
    }

    // 6. Click Listeners
    if (sidebarTrigger) {
      sidebarTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleLeft();
      });
    }

    if (panelTrigger) {
      panelTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        toggleRight();
      });
    }

    document.querySelectorAll('.toc-trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTocModal();
      });
    });

    if (mask) {
      mask.addEventListener('click', function () {
        body.setAttribute('data-sidebar', 'closed');
        body.setAttribute('data-panel', 'closed');
        body.removeAttribute('sidebar-display');
        body.removeAttribute('panel-display');
        mask.classList.add('d-none');
        updateButtons();
      });
    }

    if (popupClose) {
      popupClose.addEventListener('click', function () {
        if (popup) popup.close();
      });
    }

    if (popup) {
      popup.addEventListener('click', function (e) {
        var rect = popup.getBoundingClientRect();
        var isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          popup.close();
        }
      });
    }

    // 7. Keyboard Shortcuts:
    // - -> Go to Home
    // [ -> Toggle left sidebar
    // ] -> Toggle right panel
    // = -> Toggle reading mode (both sidebars)
    // \ -> Toggle article TOC modal
    // Escape -> Close popup or mobile drawers
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      var activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (['INPUT', 'TEXTAREA'].indexOf(activeTag) !== -1) return;
      if (document.activeElement && document.activeElement.isContentEditable) return;

      if (e.key === '-' || e.key === '－' || e.key === '—' || e.code === 'Minus') {
        var homeBtn = document.getElementById('topbar-home-btn');
        if (homeBtn) {
          e.preventDefault();
          homeBtn.click();
        }
      } else if (e.key === '[' || e.key === '【' || e.code === 'BracketLeft') {
        e.preventDefault();
        toggleLeft();
      } else if (e.key === ']' || e.key === '】' || e.code === 'BracketRight') {
        e.preventDefault();
        toggleRight();
      } else if (e.key === '=' || e.key === '＝' || e.code === 'Equal') {
        e.preventDefault();
        toggleReadingMode();
      } else if (e.key === '\\' || e.key === '、' || e.key === '|' || e.code === 'Backslash') {
        if (isPost) {
          e.preventDefault();
          toggleTocModal();
        }
      } else if (e.key === 'Escape' || e.code === 'Escape') {
        if (popup && popup.open) {
          popup.close();
        }
        if (window.innerWidth < 992) {
          body.removeAttribute('sidebar-display');
          body.removeAttribute('panel-display');
          if (mask) mask.classList.add('d-none');
        }
      }
    });

    // 8. Sticky Title on Scroll (方案三: Medium / Ghost 模式)
    if (isPost) {
      var postHeading = document.querySelector('article header h1') || document.querySelector('article h1') || document.querySelector('main h1');
      var topbarPostTitle = document.getElementById('topbar-post-title');

      if (topbarPostTitle) {
        topbarPostTitle.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      if (postHeading) {
        var ticking = false;
        function updateStickyTitle() {
          var rect = postHeading.getBoundingClientRect();
          // When the bottom of h1 passes behind the topbar (~50px), show sticky title
          if (rect.bottom < 50) {
            body.classList.add('title-sticky');
          } else {
            body.classList.remove('title-sticky');
          }
          ticking = false;
        }

        window.addEventListener('scroll', function () {
          if (!ticking) {
            window.requestAnimationFrame(updateStickyTitle);
            ticking = true;
          }
        }, { passive: true });

        // Initial check on load (in case page is loaded already scrolled)
        updateStickyTitle();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingMode);
  } else {
    initReadingMode();
  }
})();
