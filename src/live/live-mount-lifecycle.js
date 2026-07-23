export const beginMountTracking = ({
  mountSeq,
  entity,
  nowMs = Date.now(),
}) => {
  const mountToken = Number(mountSeq || 0) + 1;
  return {
    mountToken,
    nextState: {
      mountSeq: mountToken,
      mountInProgress: true,
      mountStartedAt: nowMs,
      mountTargetEntity: entity || "",
    },
  };
};

export const clearMountTrackingIfCurrent = ({
  mountSeq,
  mountToken,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
}) => {
  if (mountSeq !== mountToken) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity,
    };
  }

  return {
    mountSeq,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
};

export const invalidateMountTrackingIfActive = ({
  mountSeq,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
}) => {
  if (!mountInProgress) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity,
    };
  }

  return {
    mountSeq: Number(mountSeq || 0) + 1,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
};

export const shouldRunMountWatchdog = ({
  mountInProgress,
  mountSeq,
  mountToken,
}) => mountInProgress === true && mountSeq === mountToken;

export const applyMountWatchdogTimeout = ({ mountSeq }) => ({
  mountSeq: Number(mountSeq || 0) + 1,
  mountInProgress: false,
  mountStartedAt: 0,
  mountTargetEntity: "",
});
