(function () {
  const scenarioModules = [];
  const labModules = [];

  function buildChoice(text, targetSceneId) {
    return {
      text,
      action: () => targetSceneId,
    };
  }

  function createPlaceholderModule(definition) {
    return {
      problem: {
        id: definition.id,
        title: definition.title,
        causes: definition.causes || [],
        archetype: "placeholder",
      },
      scenes: {
        [`${definition.id}_start`]: { isPlaceholder: true },
      },
      meta: {
        status: "placeholder",
      },
    };
  }

  function validateInvestigationDefinition(definition) {
    const errors = [];

    if (!definition?.id) {
      errors.push("Scenario definition requires an id.");
    }
    if (!definition?.title) {
      errors.push("Scenario definition requires a title.");
    }
    if (!definition?.start?.colleagueText) {
      errors.push(`${definition?.id || "scenario"} is missing start.colleagueText.`);
    }
    if (!Array.isArray(definition?.rootCauses) || !definition.rootCauses.length) {
      errors.push(`${definition?.id || "scenario"} must define at least one root cause.`);
    }

    (definition?.rootCauses || []).forEach((cause, index) => {
      const label = cause?.id || `rootCause[${index}]`;
      if (!cause?.id) {
        errors.push(`Root cause ${index + 1} is missing an id.`);
      }
      if (!cause?.startChoiceText) {
        errors.push(`${label} is missing startChoiceText.`);
      }
      if (!cause?.investigation?.colleagueText) {
        errors.push(`${label} is missing investigation.colleagueText.`);
      }
      if (!cause?.investigation?.confirmChoiceText) {
        errors.push(`${label} is missing investigation.confirmChoiceText.`);
      }
      if (!cause?.confirmed?.colleagueText) {
        errors.push(`${label} is missing confirmed.colleagueText.`);
      }
      if (!cause?.resolution?.colleagueText) {
        errors.push(`${label} is missing resolution.colleagueText.`);
      }
    });

    return errors;
  }

  function createInvestigationScenario(definition) {
    const validationErrors = validateInvestigationDefinition(definition);
    if (validationErrors.length) {
      return {
        ...createPlaceholderModule({
          id: definition?.id || "invalidScenario",
          title: definition?.title || "Invalid Scenario",
          causes: definition?.rootCauses?.map((cause) => cause.id).filter(Boolean) || [],
        }),
        meta: {
          status: "invalid",
          validationErrors,
        },
      };
    }

    const scenes = {};
    const rootCauseIds = definition.rootCauses.map((cause) => cause.id);
    const startSceneId = `${definition.id}_start`;

    scenes[startSceneId] = {
      isPlaceholder: false,
      location: definition.start.location || "control_room",
      locationLabel: definition.start.locationLabel,
      scadaText: definition.start.scadaText || "",
      colleagueText: definition.start.colleagueText,
      choices: definition.rootCauses.map((cause) =>
        buildChoice(cause.startChoiceText, `${definition.id}_${cause.id}_check`)
      ),
    };

    definition.rootCauses.forEach((cause, index) => {
      const checkSceneId = `${definition.id}_${cause.id}_check`;
      const confirmedSceneId = `${definition.id}_${cause.id}_confirmed`;
      const ruledOutSceneId = `${definition.id}_${cause.id}_ruledOut`;
      const solutionSceneId = `${definition.id}_solution_${cause.id}`;
      const fallbackCauseId =
        cause.ruledOut?.jumpToCauseId ||
        rootCauseIds[index + 1] ||
        rootCauseIds[0];

      scenes[checkSceneId] = {
        isPlaceholder: false,
        location: cause.investigation.location || "control_room",
        locationLabel: cause.investigation.locationLabel,
        scadaText: cause.investigation.scadaText || "",
        colleagueText: cause.investigation.colleagueText,
        choices: [
          {
            text: cause.investigation.confirmChoiceText,
            action: (gameState) =>
              gameState.currentScenario.trueCause === cause.id
                ? confirmedSceneId
                : ruledOutSceneId,
          },
          ...((cause.investigation.badChoices || []).map((choice) => ({
            text: choice.text,
            action: () =>
              window.handleIncorrectChoice(choice.feedbackText, checkSceneId),
          })) || []),
        ],
      };

      scenes[confirmedSceneId] = {
        isPlaceholder: false,
        location: cause.confirmed.location || cause.investigation.location || "control_room",
        locationLabel: cause.confirmed.locationLabel,
        scadaText: cause.confirmed.scadaText || "",
        colleagueText: cause.confirmed.colleagueText,
        choices: [
          buildChoice(
            cause.confirmed.resolutionChoiceText || "Apply the correction package.",
            solutionSceneId
          ),
          ...((cause.confirmed.badChoices || []).map((choice) => ({
            text: choice.text,
            action: () =>
              window.handleIncorrectChoice(choice.feedbackText, confirmedSceneId),
          })) || []),
        ],
      };

      scenes[ruledOutSceneId] = {
        isPlaceholder: false,
        location: cause.ruledOut?.location || "labs",
        locationLabel: cause.ruledOut?.locationLabel,
        scadaText: cause.ruledOut?.scadaText || "",
        colleagueText:
          cause.ruledOut?.colleagueText ||
          "That evidence did not confirm the root cause. Document it and investigate another path.",
        choices: [
          buildChoice(
            cause.ruledOut?.returnChoiceText || "Return to the alarm review.",
            startSceneId
          ),
          buildChoice(
            cause.ruledOut?.jumpChoiceText || "Jump to the next best check.",
            `${definition.id}_${fallbackCauseId}_check`
          ),
        ],
      };

      scenes[solutionSceneId] = {
        isSolution: true,
        location: cause.resolution.location || "control_room",
        locationLabel: cause.resolution.locationLabel,
        scadaText: cause.resolution.scadaText || "",
        colleagueText: cause.resolution.colleagueText,
      };
    });

    return {
      problem: {
        id: definition.id,
        title: definition.title,
        causes: rootCauseIds,
        archetype: "investigation",
        summary: definition.summary || "",
      },
      scenes,
      meta: {
        status: "ready",
        rootCauseCount: rootCauseIds.length,
        validationErrors: [],
      },
    };
  }

  function registerScenarioModule(module) {
    if (!module?.problem?.id) {
      console.warn("Skipped scenario module without problem id.", module);
      return;
    }
    scenarioModules.push(module);
  }

  function createModelingLab(definition) {
    const controls = definition?.controls || [];

    return {
      lab: {
        id: definition.id,
        title: definition.title,
        summary: definition.summary || "",
        archetype: "modelingLab",
      },
      defaults: definition.defaults || {},
      brief: definition.brief || "",
      instructions: definition.instructions || [],
      controls,
      compute: definition.compute,
      meta: {
        status: definition?.id && definition?.title && typeof definition?.compute === "function"
          ? "ready"
          : "invalid",
      },
    };
  }

  function registerLabModule(module) {
    if (!module?.lab?.id) {
      console.warn("Skipped lab module without lab id.", module);
      return;
    }
    labModules.push(module);
  }

  window.WTPSim = {
    registerScenarioModule,
    getScenarioModules: () => [...scenarioModules],
    registerLabModule,
    getLabModules: () => [...labModules],
    createPlaceholderModule,
    createInvestigationScenario,
    createModelingLab,
  };
})();
