import { PAGE_IDS } from "../navigation/router.js";
import { MobileCamSwitcherController } from "./cam-switcher.ctrl.js";
import { MobileViewPageController } from "./page.ctrl.js";

const DEFAULT_FACTORIES = Object.freeze({
  createCamSwitcherController: (options) =>
    new MobileCamSwitcherController(options),
  createPageController: (card, constants) =>
    new MobileViewPageController(card, constants),
});

export const createMobileViewControllers = (
  card,
  { factories = DEFAULT_FACTORIES } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const mobileViewPageController = resolvedFactories.createPageController(
    card,
    { PAGE_IDS },
  );
  const mobileCamSwitcherController =
    resolvedFactories.createCamSwitcherController({
      isOpen: () => card._mobileCamSwitcherOpen === true,
      setOpen: (open) => {
        card._mobileCamSwitcherOpen = open === true;
      },
      renderCamSwitcher: () => card._renderCamSwitcher(),
      getPicker: () =>
        card._pageShellRegionElement?.(
          "cameraSwitcher",
          "[data-mobile-cam-picker]",
        ) || null,
      pauseSlideshowForInteraction: () =>
        card._pauseSlideshowForInteraction(),
      switchCamera: (index) => card._switchCamera(index),
    });

  return {
    _mobileViewPageController: mobileViewPageController,
    _mobileCamSwitcherController: mobileCamSwitcherController,
  };
};
