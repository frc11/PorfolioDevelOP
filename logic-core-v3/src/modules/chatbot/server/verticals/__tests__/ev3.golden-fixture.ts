/**
 * EV.3 — FIXTURE DORADA DE PARIDAD. AUTO-GENERADA. **NO EDITAR.**
 *
 * Congelada ejecutando la implementación de scoring ANTES del refactor a packs
 * verticales. El refactor debe reproducir EXACTAMENTE estos valores. Si un caso
 * falla tras el refactor, el bug está en el código — JAMÁS se ajusta este archivo.
 *
 * Regenerada solo por `ev3.generate-fixture.ts` (one-shot). 120 casos de score, 88 de decay.
 */
/* eslint-disable */
export const GOLDEN_CAPTURED_AT_ISO = "2026-01-01T00:00:00.000Z"

export const GOLDEN_SCORE_CASES = [
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "cold",
      "signals": [],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 25,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 55,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 95,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 10,
      "classification": "cold",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 55,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 35,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 80,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 75,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 5,
      "classification": "cold",
      "signals": [
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 45,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 70,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 25,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 15,
      "classification": "cold",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 85,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 35,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 80,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 70,
      "classification": "hot",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 15,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 10,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 5,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 45,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 5,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 25,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 15,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 15,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 10,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 50,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 10,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 35,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "postventa",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_postventa",
          "label": "Consulta de postventa (no compra)",
          "points": -50
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "cold",
      "signals": [],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 25,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 55,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 95,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 10,
      "classification": "cold",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 55,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 35,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 80,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 75,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": false
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 5,
      "classification": "cold",
      "signals": [
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 45,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 30,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 70,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 25,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 65,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": false,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 15,
      "classification": "cold",
      "signals": [
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 60,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": false,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 85,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 35,
      "classification": "cold",
      "signals": [
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 80,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 70,
      "classification": "hot",
      "signals": [
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "other",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "employment",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_employment",
          "label": "Descartado: busca trabajo",
          "points": 0
        }
      ],
      "dqReason": "category_employment"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "employment",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_employment",
          "label": "Descartado: busca trabajo",
          "points": 0
        }
      ],
      "dqReason": "category_employment"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "provider",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_provider",
          "label": "Descartado: proveedor (ofrece servicios)",
          "points": 0
        }
      ],
      "dqReason": "category_provider"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "provider",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_provider",
          "label": "Descartado: proveedor (ofrece servicios)",
          "points": 0
        }
      ],
      "dqReason": "category_provider"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "spam",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_spam",
          "label": "Descartado: spam",
          "points": 0
        }
      ],
      "dqReason": "category_spam"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "spam",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "dq_spam",
          "label": "Descartado: spam",
          "points": 0
        }
      ],
      "dqReason": "category_spam"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 0,
      "classification": "cold",
      "signals": [],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": null
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "+54 9 381 555 1234"
    },
    "expected": {
      "score": 0,
      "classification": "cold",
      "signals": [],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "+54 9 381 555 1234"
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": "+54 9 381 555 1234"
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "+1 555 1234"
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "+1 555 1234"
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": "+1 555 1234"
    },
    "expected": {
      "score": 95,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "123"
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "123"
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": "123"
    },
    "expected": {
      "score": 95,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "0000000"
    },
    "expected": {
      "score": 0,
      "classification": "dq",
      "signals": [
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": "negative_score_after_penalty"
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": "0000000"
    },
    "expected": {
      "score": 20,
      "classification": "cold",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": "0000000"
    },
    "expected": {
      "score": 95,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        },
        {
          "key": "penalty_invalid_phone",
          "label": "Teléfono con formato dudoso",
          "points": -20
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": false,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": ""
    },
    "expected": {
      "score": 0,
      "classification": "cold",
      "signals": [],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": false,
        "mentionedTradeIn": false,
        "askedSpecificModel": false,
        "providedPhone": false
      },
      "category": "sales",
      "phone": ""
    },
    "expected": {
      "score": 40,
      "classification": "warm",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        }
      ],
      "dqReason": null
    }
  },
  {
    "input": {
      "signals": {
        "requestedAppointment": true,
        "mentionedFinancing": true,
        "mentionedTradeIn": true,
        "askedSpecificModel": true,
        "providedPhone": true
      },
      "category": "sales",
      "phone": ""
    },
    "expected": {
      "score": 100,
      "classification": "hot",
      "signals": [
        {
          "key": "requestedAppointment",
          "label": "Pidió cita / test drive",
          "points": 40
        },
        {
          "key": "mentionedFinancing",
          "label": "Pidió financiación / cuotas",
          "points": 25
        },
        {
          "key": "mentionedTradeIn",
          "label": "Tiene usado para entregar",
          "points": 20
        },
        {
          "key": "askedSpecificModel",
          "label": "Pregunta por modelo específico",
          "points": 10
        },
        {
          "key": "providedPhone",
          "label": "Dejó teléfono",
          "points": 5
        },
        {
          "key": "combo_tradein_financing",
          "label": "Tiene usado + pide financiación (perfil de cierre)",
          "points": 10
        },
        {
          "key": "combo_specific_model_appointment",
          "label": "Sabe qué modelo quiere + agenda visita",
          "points": 5
        }
      ],
      "dqReason": null
    }
  }
]

export const GOLDEN_DECAY_CASES = [
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": -3600000,
    "expected": {
      "effectiveScore": 100,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 100,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 43200000,
    "expected": {
      "effectiveScore": 100,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 82800000,
    "expected": {
      "effectiveScore": 100,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.9583333333333334
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 86400000,
    "expected": {
      "effectiveScore": 90,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 129600000,
    "expected": {
      "effectiveScore": 90,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 169200000,
    "expected": {
      "effectiveScore": 90,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.9583333333333333
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 75,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 216000000,
    "expected": {
      "effectiveScore": 75,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 255600000,
    "expected": {
      "effectiveScore": 75,
      "effectiveClassification": "hot",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.9583333333333335
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 259200000,
    "expected": {
      "effectiveScore": 60,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 3
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 360000000,
    "expected": {
      "effectiveScore": 60,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 4.166666666666667
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 604800000,
    "expected": {
      "effectiveScore": 45,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 7
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 864000000,
    "expected": {
      "effectiveScore": 45,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 10
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 1209600000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 14
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 1296000000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 15
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 100,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 30
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": -3600000,
    "expected": {
      "effectiveScore": 70,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 70,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 43200000,
    "expected": {
      "effectiveScore": 70,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 82800000,
    "expected": {
      "effectiveScore": 70,
      "effectiveClassification": "hot",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.9583333333333334
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 86400000,
    "expected": {
      "effectiveScore": 63,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 129600000,
    "expected": {
      "effectiveScore": 63,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 169200000,
    "expected": {
      "effectiveScore": 63,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.9583333333333333
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 53,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 216000000,
    "expected": {
      "effectiveScore": 53,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 255600000,
    "expected": {
      "effectiveScore": 53,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.9583333333333335
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 259200000,
    "expected": {
      "effectiveScore": 42,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 3
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 360000000,
    "expected": {
      "effectiveScore": 42,
      "effectiveClassification": "warm",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 4.166666666666667
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 604800000,
    "expected": {
      "effectiveScore": 32,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 7
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 864000000,
    "expected": {
      "effectiveScore": 32,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 10
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 1209600000,
    "expected": {
      "effectiveScore": 21,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 14
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 1296000000,
    "expected": {
      "effectiveScore": 21,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 15
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 70,
    "classification": "hot",
    "baseScore": null,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 21,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 30
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": -3600000,
    "expected": {
      "effectiveScore": 40,
      "effectiveClassification": "warm",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 40,
      "effectiveClassification": "warm",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 43200000,
    "expected": {
      "effectiveScore": 40,
      "effectiveClassification": "warm",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 82800000,
    "expected": {
      "effectiveScore": 40,
      "effectiveClassification": "warm",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.9583333333333334
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 86400000,
    "expected": {
      "effectiveScore": 36,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 129600000,
    "expected": {
      "effectiveScore": 36,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 169200000,
    "expected": {
      "effectiveScore": 36,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.9583333333333333
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 216000000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 255600000,
    "expected": {
      "effectiveScore": 30,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.9583333333333335
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 259200000,
    "expected": {
      "effectiveScore": 24,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 3
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 360000000,
    "expected": {
      "effectiveScore": 24,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 4.166666666666667
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 604800000,
    "expected": {
      "effectiveScore": 18,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 7
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 864000000,
    "expected": {
      "effectiveScore": 18,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 10
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 1209600000,
    "expected": {
      "effectiveScore": 12,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 14
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 1296000000,
    "expected": {
      "effectiveScore": 12,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 15
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 40,
    "classification": "warm",
    "baseScore": null,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 12,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 30
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": -3600000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 43200000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 82800000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0.9583333333333334
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 86400000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 129600000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 169200000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.9,
      "decayTier": "cooling",
      "decayTierLabel": "Un día sin responder",
      "ageDays": 1.9583333333333333
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 216000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.5
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 255600000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.75,
      "decayTier": "warm",
      "decayTierLabel": "Dos días sin responder",
      "ageDays": 2.9583333333333335
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 259200000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 3
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 360000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.6,
      "decayTier": "urgent",
      "decayTierLabel": "Casi una semana sin responder",
      "ageDays": 4.166666666666667
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 604800000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 7
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 864000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.45,
      "decayTier": "cold",
      "decayTierLabel": "Más de una semana frío",
      "ageDays": 10
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 1209600000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 14
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 1296000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 15
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "cold",
    "baseScore": null,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "cold",
      "decayMultiplier": 0.3,
      "decayTier": "archived",
      "decayTierLabel": "Casi perdido",
      "ageDays": 30
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "dq",
    "baseScore": null,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "dq",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "dq",
    "baseScore": null,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "dq",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "getEffectiveScore",
    "score": 0,
    "classification": "dq",
    "baseScore": null,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 0,
      "effectiveClassification": "dq",
      "decayMultiplier": 1,
      "decayTier": "fresh",
      "decayTierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": -3600000,
    "expected": {
      "effectiveScore": 100,
      "multiplier": 1,
      "tier": "fresh",
      "tierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 0,
    "expected": {
      "effectiveScore": 100,
      "multiplier": 1,
      "tier": "fresh",
      "tierLabel": "Recién capturado",
      "ageDays": 0
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 43200000,
    "expected": {
      "effectiveScore": 100,
      "multiplier": 1,
      "tier": "fresh",
      "tierLabel": "Recién capturado",
      "ageDays": 0.5
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 82800000,
    "expected": {
      "effectiveScore": 100,
      "multiplier": 1,
      "tier": "fresh",
      "tierLabel": "Recién capturado",
      "ageDays": 0.9583333333333334
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 86400000,
    "expected": {
      "effectiveScore": 90,
      "multiplier": 0.9,
      "tier": "cooling",
      "tierLabel": "Un día sin responder",
      "ageDays": 1
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 129600000,
    "expected": {
      "effectiveScore": 90,
      "multiplier": 0.9,
      "tier": "cooling",
      "tierLabel": "Un día sin responder",
      "ageDays": 1.5
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 169200000,
    "expected": {
      "effectiveScore": 90,
      "multiplier": 0.9,
      "tier": "cooling",
      "tierLabel": "Un día sin responder",
      "ageDays": 1.9583333333333333
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 172800000,
    "expected": {
      "effectiveScore": 75,
      "multiplier": 0.75,
      "tier": "warm",
      "tierLabel": "Dos días sin responder",
      "ageDays": 2
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 216000000,
    "expected": {
      "effectiveScore": 75,
      "multiplier": 0.75,
      "tier": "warm",
      "tierLabel": "Dos días sin responder",
      "ageDays": 2.5
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 255600000,
    "expected": {
      "effectiveScore": 75,
      "multiplier": 0.75,
      "tier": "warm",
      "tierLabel": "Dos días sin responder",
      "ageDays": 2.9583333333333335
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 259200000,
    "expected": {
      "effectiveScore": 60,
      "multiplier": 0.6,
      "tier": "urgent",
      "tierLabel": "Casi una semana sin responder",
      "ageDays": 3
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 360000000,
    "expected": {
      "effectiveScore": 60,
      "multiplier": 0.6,
      "tier": "urgent",
      "tierLabel": "Casi una semana sin responder",
      "ageDays": 4.166666666666667
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 604800000,
    "expected": {
      "effectiveScore": 45,
      "multiplier": 0.45,
      "tier": "cold",
      "tierLabel": "Más de una semana frío",
      "ageDays": 7
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 864000000,
    "expected": {
      "effectiveScore": 45,
      "multiplier": 0.45,
      "tier": "cold",
      "tierLabel": "Más de una semana frío",
      "ageDays": 10
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 1209600000,
    "expected": {
      "effectiveScore": 30,
      "multiplier": 0.3,
      "tier": "archived",
      "tierLabel": "Casi perdido",
      "ageDays": 14
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 1296000000,
    "expected": {
      "effectiveScore": 30,
      "multiplier": 0.3,
      "tier": "archived",
      "tierLabel": "Casi perdido",
      "ageDays": 15
    }
  },
  {
    "kind": "applyTimeDecay",
    "score": 0,
    "classification": null,
    "baseScore": 100,
    "offsetMs": 2592000000,
    "expected": {
      "effectiveScore": 30,
      "multiplier": 0.3,
      "tier": "archived",
      "tierLabel": "Casi perdido",
      "ageDays": 30
    }
  }
]
