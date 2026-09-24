import { resolvePtzHoldPlan } from "./index.js";
import { PtzInteractionController } from "./interaction.ctrl.js";
import { PtzMotionController } from "./motion.ctrl.js";

export const createPtzMotionController = (card) =>
  new PtzMotionController({
    resolveContext: () => card._resolvePtzMotionContext(),
    resolveHoldPlan: resolvePtzHoldPlan,
    executeAction: (context) => card._executePtzCameraAction(context),
    onError: (error, context) => {
      console.warn("[Frigate] PTZ motion failed", context, error);
    },
  });

export const createPtzInteractionController = (card) =>
  new PtzInteractionController(card);
