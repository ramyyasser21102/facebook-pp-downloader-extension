export default defineContentScript({
  matches: ['*://*.facebook.com/*'],
  main() {
    console.log('Hello content.');
  },
});
