export {
  calculateLeadScore,
  classifyScore,
  applyTimeDecay,
  getEffectiveScore,
  getScoreExplanation,
  SCORING_TABLE,
  COMBO_BONUSES,
  DECAY_CURVE,
  HOT_THRESHOLD,
  WARM_THRESHOLD,
  POSTVENTA_PENALTY,
  INVALID_PHONE_PENALTY,
} from './calculateLeadScore'
export type {
  LeadSignals,
  LeadScoreClassification,
  LeadCategoryForScoring,
  ScoredSignal,
  ScoreInput,
  ScoreResult,
  ComboBonus,
  DecayTier,
  DecayResult,
  LeadScoreSnapshot,
  EffectiveScoreResult,
  ScoreExplanationKind,
  ScoreExplanationLine,
} from './calculateLeadScore'

export {
  validateArgentinePhone,
  isValidArgentinePhone,
} from './validateArgentinePhone'
export type { PhoneValidationResult } from './validateArgentinePhone'

export { excludeDqWhere } from './dqFilter'
