import { resolvePtzHoldPlan } from "./index.js";
import { createPtzActionController } from "./action.ctrl.js";
import { createPtzCapabilityController } from "./capability.ctrl.js";
import { PtzInteractionController } from "./interaction.ctrl.js";
import { PtzMotionController } from "./motion.ctrl.js";

export { createPtzActionController, createPtzCapabilityController };

export const createPtzMotionController = (card) =>
  new PtzMotionController({
    resolveContext: () => card._ptzCapabilityController.resolveContext(),
    resolveHoldPlan: resolvePtzHoldPlan,
    executeAction: (context) => card._ptzExec.execute(context),
    onError: (error, context) => {
      console.warn("[Frigate] PTZ motion failed", context, error);
    },
  });

export const createPtzInteractionController = (card) =>
  new PtzInteractionController(card);
