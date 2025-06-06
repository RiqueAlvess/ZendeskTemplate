(function () {
    'use strict';
  
    const ENTER = 13;
    const ESCAPE = 27;
  
    function toggleNavigation(toggle, menu) {
      const isExpanded = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", !isExpanded);
      toggle.setAttribute("aria-expanded", !isExpanded);
    }
  
    function closeNavigation(toggle, menu) {
      menu.setAttribute("aria-expanded", false);
      toggle.setAttribute("aria-expanded", false);
      toggle.focus();
    }
  
    function initializeDropdowns() {
      document.querySelectorAll('.dropdown .dropdown-toggle').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const aberto = btn.getAttribute('aria-expanded') === 'true';
          
          document.querySelectorAll('.dropdown .dropdown-toggle').forEach(function(otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.setAttribute('aria-expanded', 'false');
            }
          });
          
          btn.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        });
      });

      document.addEventListener('click', function(e) {
        document.querySelectorAll('.dropdown').forEach(function(wrapper) {
          const btn = wrapper.querySelector('.dropdown-toggle');
          if (!wrapper.contains(e.target)) {
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('.dropdown .dropdown-toggle').forEach(function(btn) {
            btn.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }
  
    function initializeMobileMenu() {
      const menuButton = document.querySelector(".menu-button-mobile");
      const menuList = document.querySelector("#user-nav-mobile");
  
      if (menuButton && menuList) {
        menuButton.addEventListener("click", function(event) {
          event.stopPropagation();
          const isExpanded = menuList.getAttribute("aria-expanded") === "true";
          menuList.setAttribute("aria-expanded", !isExpanded);
          menuButton.setAttribute("aria-expanded", !isExpanded);
        });

        document.addEventListener("click", function(event) {
          if (!menuButton.contains(event.target) && !menuList.contains(event.target)) {
            menuList.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-expanded", "false");
          }
        });

        document.addEventListener("keydown", function(event) {
          if (event.key === "Escape") {
            menuList.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-expanded", "false");
          }
        });
      }
    }

    function initializeNavigation() {
      const collapsible = document.querySelectorAll(
        ".collapsible-nav, .collapsible-sidebar"
      );
  
      collapsible.forEach((element) => {
        const toggle = element.querySelector(
          ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
        );
  
        if (toggle) {
          element.addEventListener("click", () => {
            toggleNavigation(toggle, element);
          });
  
          element.addEventListener("keyup", (event) => {
            if (event.keyCode === ESCAPE) {
              closeNavigation(toggle, element);
            }
          });
        }
      });
  
      const multibrandFilterLists = document.querySelectorAll(
        ".multibrand-filter-list"
      );
      multibrandFilterLists.forEach((filter) => {
        if (filter.children.length > 6) {
          const trigger = filter.querySelector(".see-all-filters");
          if (trigger) {
            trigger.setAttribute("aria-hidden", false);
            trigger.addEventListener("click", (event) => {
              event.stopPropagation();
              trigger.parentNode.removeChild(trigger);
              filter.classList.remove("multibrand-filter-list--collapsed");
            });
          }
        }
      });
    }
  
    const isPrintableChar = (str) => {
      return str.length === 1 && str.match(/^\S$/);
    };
  
    function Dropdown(toggle, menu) {
      this.toggle = toggle;
      this.menu = menu;
  
      this.menuPlacement = {
        top: menu.classList.contains("dropdown-menu-top"),
        end: menu.classList.contains("dropdown-menu-end"),
      };
  
      this.toggle.addEventListener("click", this.clickHandler.bind(this));
      this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
      this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
      document.body.addEventListener("click", this.outsideClickHandler.bind(this));
  
      const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
      const menuId = this.menu.getAttribute("id") || crypto.randomUUID();
  
      this.toggle.setAttribute("id", toggleId);
      this.menu.setAttribute("id", menuId);
  
      this.toggle.setAttribute("aria-controls", menuId);
      this.menu.setAttribute("aria-labelledby", toggleId);
  
      this.menu.setAttribute("tabindex", -1);
      this.menuItems.forEach((menuItem) => {
        menuItem.tabIndex = -1;
      });
  
      this.focusedIndex = -1;
    }
  
    Dropdown.prototype = {
      get isExpanded() {
        return this.toggle.getAttribute("aria-expanded") === "true";
      },
  
      get menuItems() {
        return Array.prototype.slice.call(
          this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
        );
      },
  
      dismiss: function () {
        if (!this.isExpanded) return;
        this.toggle.removeAttribute("aria-expanded");
        this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
        this.focusedIndex = -1;
      },
  
      open: function () {
        if (this.isExpanded) return;
        this.toggle.setAttribute("aria-expanded", true);
        this.handleOverflow();
      },
  
      handleOverflow: function () {
        var rect = this.menu.getBoundingClientRect();
        var overflow = {
          right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
          bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
        };
  
        if (overflow.right || this.menuPlacement.end) {
          this.menu.classList.add("dropdown-menu-end");
        }
  
        if (overflow.bottom || this.menuPlacement.top) {
          this.menu.classList.add("dropdown-menu-top");
        }
  
        if (this.menu.getBoundingClientRect().top < 0) {
          this.menu.classList.remove("dropdown-menu-top");
        }
      },
  
      focusByIndex: function (index) {
        if (!this.menuItems.length) return;
        this.menuItems.forEach((item, itemIndex) => {
          if (itemIndex === index) {
            item.tabIndex = 0;
            item.focus();
          } else {
            item.tabIndex = -1;
          }
        });
        this.focusedIndex = index;
      },
  
      focusFirstMenuItem: function () {
        this.focusByIndex(0);
      },
  
      focusLastMenuItem: function () {
        this.focusByIndex(this.menuItems.length - 1);
      },
  
      focusNextMenuItem: function (currentItem) {
        if (!this.menuItems.length) return;
        const currentIndex = this.menuItems.indexOf(currentItem);
        const nextIndex = (currentIndex + 1) % this.menuItems.length;
        this.focusByIndex(nextIndex);
      },
  
      focusPreviousMenuItem: function (currentItem) {
        if (!this.menuItems.length) return;
        const currentIndex = this.menuItems.indexOf(currentItem);
        const previousIndex =
          currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;
        this.focusByIndex(previousIndex);
      },
  
      focusByChar: function (currentItem, char) {
        char = char.toLowerCase();
        const itemChars = this.menuItems.map((menuItem) =>
          menuItem.textContent.trim()[0].toLowerCase()
        );
        const startIndex =
          (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;
        let index = itemChars.indexOf(char, startIndex);
        if (index === -1) {
          index = itemChars.indexOf(char, 0);
        }
        if (index > -1) {
          this.focusByIndex(index);
        }
      },
  
      outsideClickHandler: function (e) {
        if (
          this.isExpanded &&
          !this.toggle.contains(e.target) &&
          !e.composedPath().includes(this.menu)
        ) {
          this.dismiss();
          this.toggle.focus();
        }
      },
  
      clickHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.isExpanded) {
          this.dismiss();
          this.toggle.focus();
        } else {
          this.open();
          this.focusFirstMenuItem();
        }
      },
  
      toggleKeyHandler: function (e) {
        const key = e.key;
        switch (key) {
          case "Enter":
          case " ":
          case "ArrowDown":
          case "Down": {
            e.stopPropagation();
            e.preventDefault();
            this.open();
            this.focusFirstMenuItem();
            break;
          }
          case "ArrowUp":
          case "Up": {
            e.stopPropagation();
            e.preventDefault();
            this.open();
            this.focusLastMenuItem();
            break;
          }
          case "Esc":
          case "Escape": {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
            break;
          }
        }
      },
  
      menuKeyHandler: function (e) {
        const key = e.key;
        const currentElement = this.menuItems[this.focusedIndex];
        if (e.ctrlKey || e.altKey || e.metaKey) {
          return;
        }
        switch (key) {
          case "Esc":
          case "Escape": {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
            break;
          }
          case "ArrowDown":
          case "Down": {
            e.stopPropagation();
            e.preventDefault();
            this.focusNextMenuItem(currentElement);
            break;
          }
          case "ArrowUp":
          case "Up": {
            e.stopPropagation();
            e.preventDefault();
            this.focusPreviousMenuItem(currentElement);
            break;
          }
          case "Home":
          case "PageUp": {
            e.stopPropagation();
            e.preventDefault();
            this.focusFirstMenuItem();
            break;
          }
          case "End":
          case "PageDown": {
            e.stopPropagation();
            e.preventDefault();
            this.focusLastMenuItem();
            break;
          }
          case "Tab": {
            if (e.shiftKey) {
              e.stopPropagation();
              e.preventDefault();
              this.dismiss();
              this.toggle.focus();
            } else {
              this.dismiss();
            }
            break;
          }
          default: {
            if (isPrintableChar(key)) {
              e.stopPropagation();
              e.preventDefault();
              this.focusByChar(currentElement, key);
            }
          }
        }
      },
    };
  
    function initializeZendeskDropdowns() {
      const dropdowns = [];
      const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
      dropdownToggles.forEach((toggle) => {
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains("dropdown-menu")) {
          dropdowns.push(new Dropdown(toggle, menu));
        }
      });
    }
  
    function initializeShare() {
      const links = document.querySelectorAll(".share a");
      links.forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
          event.preventDefault();
          window.open(anchor.href, "", "height = 500, width = 500");
        });
      });
    }
  
    function debounce(callback, wait) {
      let timeoutId = null;
      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          callback.apply(null, args);
        }, wait);
      };
    }
  
    let searchFormFilledClassName = "search-has-value";
    let searchFormSelector = "form[role='search']";
  
    function clearSearchInput(event) {
      event.target
        .closest(searchFormSelector)
        .classList.remove(searchFormFilledClassName);
  
      let input;
      if (event.target.tagName === "INPUT") {
        input = event.target;
      } else if (event.target.tagName === "BUTTON") {
        input = event.target.previousElementSibling;
      } else {
        input = event.target.closest("button").previousElementSibling;
      }
      input.value = "";
      input.focus();
    }
  
    function clearSearchInputOnKeypress(event) {
      const searchInputDeleteKeys = ["Delete", "Escape"];
      if (searchInputDeleteKeys.includes(event.key)) {
        clearSearchInput(event);
      }
    }
  
    function buildClearSearchButton(inputId) {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("aria-controls", inputId);
      button.classList.add("clear-button");
      const buttonLabel = window.searchClearButtonLabelLocalized;
      const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
      button.innerHTML = icon;
      button.addEventListener("click", clearSearchInput);
      button.addEventListener("keyup", clearSearchInputOnKeypress);
      return button;
    }
  
    function appendClearSearchButton(input, form) {
      const searchClearButton = buildClearSearchButton(input.id);
      form.append(searchClearButton);
      if (input.value.length > 0) {
        form.classList.add(searchFormFilledClassName);
      }
    }
  
    const toggleClearSearchButtonAvailability = debounce((event) => {
      const form = event.target.closest(searchFormSelector);
      form.classList.toggle(
        searchFormFilledClassName,
        event.target.value.length > 0
      );
    }, 200);
  
    function initializeSearch() {
      const searchForms = [...document.querySelectorAll(searchFormSelector)];
      const searchInputs = searchForms.map((form) =>
        form.querySelector("input[type='search']")
      );
      searchInputs.forEach((input) => {
        if (input) {
          appendClearSearchButton(input, input.closest(searchFormSelector));
          input.addEventListener("keyup", clearSearchInputOnKeypress);
          input.addEventListener("keyup", toggleClearSearchButtonAvailability);
        }
      });
    }
  
    const key = "returnFocusTo";
  
    function saveFocus() {
      const activeElementId = document.activeElement.getAttribute("id");
      sessionStorage.setItem(key, "#" + activeElementId);
    }
  
    function returnFocus() {
      const returnFocusTo = sessionStorage.getItem(key);
      if (returnFocusTo) {
        sessionStorage.removeItem("returnFocusTo");
        const returnFocusToEl = document.querySelector(returnFocusTo);
        returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
      }
    }
  
    function initializeForms() {
      returnFocus();
  
      const commentContainerTextarea = document.querySelector(
        ".comment-container textarea"
      );
      const commentContainerFormControls = document.querySelector(
        ".comment-form-controls, .comment-ccs"
      );
  
      if (commentContainerTextarea) {
        commentContainerTextarea.addEventListener(
          "focus",
          function focusCommentContainerTextarea() {
            commentContainerFormControls.style.display = "block";
            commentContainerTextarea.removeEventListener(
              "focus",
              focusCommentContainerTextarea
            );
          }
        );
  
        if (commentContainerTextarea.value !== "") {
          commentContainerFormControls.style.display = "block";
        }
      }
  
      const showRequestCommentContainerTrigger = document.querySelector(
        ".request-container .comment-container .comment-show-container"
      );
      const requestCommentFields = document.querySelectorAll(
        ".request-container .comment-container .comment-fields"
      );
      const requestCommentSubmit = document.querySelector(
        ".request-container .comment-container .request-submit-comment"
      );
  
      if (showRequestCommentContainerTrigger) {
        showRequestCommentContainerTrigger.addEventListener("click", () => {
          showRequestCommentContainerTrigger.style.display = "none";
          Array.prototype.forEach.call(requestCommentFields, (element) => {
            element.style.display = "block";
          });
          requestCommentSubmit.style.display = "inline-block";
  
          if (commentContainerTextarea) {
            commentContainerTextarea.focus();
          }
        });
      }
  
      const requestMarkAsSolvedButton = document.querySelector(
        ".request-container .mark-as-solved:not([data-disabled])"
      );
      const requestMarkAsSolvedCheckbox = document.querySelector(
        ".request-container .comment-container input[type=checkbox]"
      );
      const requestCommentSubmitButton = document.querySelector(
        ".request-container .comment-container input[type=submit]"
      );
  
      if (requestMarkAsSolvedButton) {
        requestMarkAsSolvedButton.addEventListener("click", () => {
          requestMarkAsSolvedCheckbox.setAttribute("checked", true);
          requestCommentSubmitButton.disabled = true;
          requestMarkAsSolvedButton.setAttribute("data-disabled", true);
          requestMarkAsSolvedButton.form.submit();
        });
      }
  
      const requestCommentTextarea = document.querySelector(
        ".request-container .comment-container textarea"
      );
  
      const usesWysiwyg =
        requestCommentTextarea &&
        requestCommentTextarea.dataset.helper === "wysiwyg";
  
      function isEmptyPlaintext(s) {
        return s.trim() === "";
      }
  
      function isEmptyHtml(xml) {
        const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
        const img = doc.querySelector("img");
        return img === null && isEmptyPlaintext(doc.children[0].textContent);
      }
  
      const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;
  
      if (requestCommentTextarea) {
        requestCommentTextarea.addEventListener("input", () => {
          if (isEmpty(requestCommentTextarea.value)) {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute("data-solve-translation");
            }
          } else {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute(
                  "data-solve-and-submit-translation"
                );
            }
          }
        });
      }
  
      const selects = document.querySelectorAll(
        "#request-status-select, #request-organization-select"
      );
  
      selects.forEach((element) => {
        element.addEventListener("change", (event) => {
          event.stopPropagation();
          saveFocus();
          element.form.submit();
        });
      });
  
      const quickSearch = document.querySelector("#quick-search");
      if (quickSearch) {
        quickSearch.addEventListener("keyup", (event) => {
          if (event.keyCode === ENTER) {
            event.stopPropagation();
            saveFocus();
            quickSearch.form.submit();
          }
        });
      }
  
      const requestOrganisationSelect = document.querySelector(
        "#request-organization select"
      );
  
      if (requestOrganisationSelect) {
        requestOrganisationSelect.addEventListener("change", () => {
          requestOrganisationSelect.form.submit();
        });
  
        requestOrganisationSelect.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
  
      const notificationElm = document.querySelector(".notification-error");
      if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
      ) {
        notificationElm.previousElementSibling.focus();
      }
    }

    window.addEventListener("DOMContentLoaded", () => {
      initializeMobileMenu();
      initializeDropdowns();
      initializeNavigation();
      initializeZendeskDropdowns();
      initializeShare();
      initializeSearch();
      initializeForms();
    });
  
  })();