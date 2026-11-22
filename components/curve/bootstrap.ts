// Reserve the route's initial viewport before the client enhancement starts.
// Without scripting, the server-rendered archive remains the default view.
export const curveBootstrap = `
(() => {
  if (!/^\\/work\\/?$/.test(location.pathname)) return;
  if (matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches) return;
  if (navigator.deviceMemory <= 1 || navigator.connection?.saveData) return;
  const query = new URLSearchParams(location.search);
  if (query.get('view') === 'list') return;
  try {
    if (query.get('curve') !== '1' && sessionStorage.getItem('hamid-work-view') === 'list') return;
  } catch {}
  document.documentElement.setAttribute('data-curve-start', '');
  setTimeout(() => {
    if (!document.querySelector('.curve-experience[data-client-ready]'))
      document.documentElement.removeAttribute('data-curve-start');
  }, 4000);
})();
`;
