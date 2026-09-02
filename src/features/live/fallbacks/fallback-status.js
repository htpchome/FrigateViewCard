export const setFallbackStatusVisible = ({ statusEl, visible }) => {
  if (!statusEl) return;
  statusEl.hidden = !visible;
};

export const hideFallbackStatus = (statusEl) => {
  setFallbackStatusVisible({
    statusEl,
    visible: false,
  });
};

export const showFallbackStatus = (statusEl) => {
  setFallbackStatusVisible({
    statusEl,
    visible: true,
  });
};
