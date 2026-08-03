import {
  humanizeProjectError,
  installProjectLanguageFirewall,
  translateProjectText
} from './core/project-operations-language.js';

installProjectLanguageFirewall();

Object.defineProperty(globalThis, 'GummyProjectLanguage', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: Object.freeze({
    translate: translateProjectText,
    humanizeError: humanizeProjectError
  })
});
