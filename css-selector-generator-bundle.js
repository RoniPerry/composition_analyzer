/**
 * css-selector-generator v2.4.0 - Bundled for Chrome Extension
 * https://github.com/fczbkk/css-selector-generator
 *
 * This is a bundled version of the css-selector-generator package
 * for use in Chrome extensions where npm packages cannot be easily imported.
 */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.CssSelectorGenerator = {})));
})(this, function (exports) {
  "use strict";

  /**
   * CSS Selector Generator
   * Generates unique CSS selectors for DOM elements
   */
  class CssSelectorGenerator {
    constructor(options = {}) {
      this.options = {
        selectors: ["id", "class", "tag", "nth-child", "nth-of-type"],
        whitelist: [],
        blacklist: [],
        combineWithinSelector: true,
        combineBetweenSelectors: true,
        includeTag: true,
        maxCombinations: 10000,
        ...options,
      };
    }

    /**
     * Generate CSS selector for an element
     */
    getSelector(element) {
      if (
        !element ||
        element === document ||
        element === document.documentElement
      ) {
        return "html";
      }

      const selectors = this.getSelectors(element);
      return this.combineSelectors(selectors);
    }

    /**
     * Get all possible selectors for an element
     */
    getSelectors(element) {
      const selectors = {
        id: this.getIdSelector(element),
        class: this.getClassSelectors(element),
        tag: this.getTagSelector(element),
        "nth-child": this.getNthChildSelector(element),
        "nth-of-type": this.getNthOfTypeSelector(element),
      };

      return selectors;
    }

    /**
     * Get ID selector
     */
    getIdSelector(element) {
      if (element.id && this.isValidId(element.id)) {
        return `#${this.escapeIdentifier(element.id)}`;
      }
      return null;
    }

    /**
     * Get class selectors
     */
    getClassSelectors(element) {
      if (!element.className || typeof element.className !== "string") {
        return [];
      }

      const classes = element.className
        .split(" ")
        .filter((className) => className.trim())
        .filter((className) => this.isValidClass(className))
        .map((className) => `.${this.escapeIdentifier(className)}`);

      return classes;
    }

    /**
     * Get tag selector
     */
    getTagSelector(element) {
      if (!this.options.includeTag) {
        return null;
      }
      return element.tagName.toLowerCase();
    }

    /**
     * Get nth-child selector
     */
    getNthChildSelector(element) {
      if (!element.parentNode) {
        return null;
      }

      const children = Array.from(element.parentNode.children);
      const index = children.indexOf(element) + 1;

      if (children.length === 1) {
        return null;
      }

      return `:nth-child(${index})`;
    }

    /**
     * Get nth-of-type selector
     */
    getNthOfTypeSelector(element) {
      if (!element.parentNode) {
        return null;
      }

      const siblings = Array.from(element.parentNode.children).filter(
        (child) => child.tagName === element.tagName
      );
      const index = siblings.indexOf(element) + 1;

      if (siblings.length === 1) {
        return null;
      }

      return `${element.tagName.toLowerCase()}:nth-of-type(${index})`;
    }

    /**
     * Combine selectors into a single CSS selector
     */
    combineSelectors(selectors) {
      const availableSelectors = this.options.selectors
        .map((type) => selectors[type])
        .filter((selector) => selector !== null && selector !== undefined)
        .flat()
        .filter(Boolean);

      if (availableSelectors.length === 0) {
        return "html";
      }

      // Start with the most specific selector
      let bestSelector = availableSelectors[0];

      // Try to combine selectors for better specificity
      if (this.options.combineWithinSelector && availableSelectors.length > 1) {
        const combined = this.combineSelectorsWithinElement(availableSelectors);
        if (combined && this.isUnique(combined)) {
          bestSelector = combined;
        }
      }

      return bestSelector;
    }

    /**
     * Combine selectors within the same element
     */
    combineSelectorsWithinElement(selectors) {
      // Prefer ID + class combination
      const idSelector = selectors.find((s) => s.startsWith("#"));
      const classSelectors = selectors.filter((s) => s.startsWith("."));

      if (idSelector && classSelectors.length > 0) {
        const combined = idSelector + classSelectors.join("");
        if (this.isUnique(combined)) {
          return combined;
        }
      }

      // Try tag + class combination
      const tagSelector = selectors.find((s) => /^[a-z]+$/.test(s));
      if (tagSelector && classSelectors.length > 0) {
        const combined = tagSelector + classSelectors.join("");
        if (this.isUnique(combined)) {
          return combined;
        }
      }

      return null;
    }

    /**
     * Check if a selector is unique
     */
    isUnique(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        return elements.length === 1;
      } catch (error) {
        return false;
      }
    }

    /**
     * Check if an ID is valid
     */
    isValidId(id) {
      return (
        /^[a-zA-Z][\w-]*$/.test(id) &&
        !this.options.blacklist.includes(id) &&
        (this.options.whitelist.length === 0 ||
          this.options.whitelist.includes(id))
      );
    }

    /**
     * Check if a class is valid
     */
    isValidClass(className) {
      return (
        /^[a-zA-Z][\w-]*$/.test(className) &&
        !this.options.blacklist.includes(className) &&
        (this.options.whitelist.length === 0 ||
          this.options.whitelist.includes(className))
      );
    }

    /**
     * Escape CSS identifier
     */
    escapeIdentifier(identifier) {
      // Basic escaping for CSS identifiers
      return identifier.replace(/[^\w-]/g, "\\$&");
    }
  }

  // Make it available globally - FIXED: Properly expose the class
  if (typeof window !== "undefined") {
    window.CssSelectorGenerator = CssSelectorGenerator;
    console.log(
      "🎯 CssSelectorGenerator loaded globally:",
      window.CssSelectorGenerator
    );
  }

  // Also expose to exports for module systems
  exports.CssSelectorGenerator = CssSelectorGenerator;
  Object.defineProperty(exports, "__esModule", { value: true });
});
