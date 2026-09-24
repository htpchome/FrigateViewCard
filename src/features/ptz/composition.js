import { resolvePtzHoldPlan } from "./index.js";
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
