import {
  buildCalendarPanelMarkup,
  buildFilterPanelMarkup,
} from "./calendar-filter.tmpl.js";
import { BrowseCalendarActivityController } from "./calendar-activity.ctrl.js";
import { BrowseCalendarPanelController } from "./calendar-panel.ctrl.js";
import { BrowseCollectionController } from "./collection.ctrl.js";
import { BrowseFilterController } from "./filter-state.js";
import { BrowseFavoriteMutationController } from "./favorite-mutation.ctrl.js";
import { BrowseTabDataController } from "./tab-data.ctrl.js";
import { BrowseWindowLoaderController } from "./window-loader.ctrl.js";
import {
  renderBrowseEventListItem,
  renderBrowseReviewListItem,
} from "./item-presentation.ctrl.js";

export { renderBrowseEventListItem, renderBrowseReviewListItem };

const DEFAULT_FACTORIES = Object.freeze({
  createCalendarActivityController: (card) =>
    new BrowseCalendarActivityController(card),
  createCalendarPanelController: (card, options) =>
    new BrowseCalendarPanelController(card, options),
  createCollectionController: (card) =>
    new BrowseCollectionController(card),
  createFilterController: (card, options) =>
    new BrowseFilterController(card, options),
  createFavoriteMutationController: (card) =>
    new BrowseFavoriteMutationController(card),
  createTabDataController: (card) => new BrowseTabDataController(card),
  createWindowLoaderController: (card) =>
    new BrowseWindowLoaderController(card),
});

export const createBrowseControllers = (
  card,
  { factories = DEFAULT_FACTORIES } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };

  return {
    _browseCalendarActivityController:
      resolvedFactories.createCalendarActivityController(card),
    _browseCalendarPanelController:
      resolvedFactories.createCalendarPanelController(card, {
        buildCalendarPanelMarkup,
      }),
    _browseCollectionController:
      resolvedFactories.createCollectionController(card),
    _browseFilterController: resolvedFactories.createFilterController(card, {
      buildFilterPanelMarkup,
    }),
    _browseFavoriteMutationController:
      resolvedFactories.createFavoriteMutationController(card),
    _browseTabDataController:
      resolvedFactories.createTabDataController(card),
    _browseWindowLoaderController:
      resolvedFactories.createWindowLoaderController(card),
  };
};
