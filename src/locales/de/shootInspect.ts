export const shootInspect = {
  title: 'Shoot & Inspect Configuration',
  sections: {
    photoSettings: 'Photo Settings',
    aiAnalysis: 'AI Analysis',
    damageDetection: 'Damage Detection',
    qualityControl: 'Quality Control',
  },
  photoSettings: {
    requiredPhotos: 'Required Photos',
    minPhotos: 'Minimum Photos',
    maxPhotos: 'Maximum Photos',
    photoQuality: 'Photo Quality',
    allowedFormats: 'Allowed Formats',
    maxFileSize: 'Max File Size',
  },
  aiAnalysis: {
    enabled: 'AI Analysis Enabled',
    confidenceThreshold: 'Confidence Threshold',
    autoApprove: 'Auto-Approve High Confidence',
    requireHumanReview: 'Require Human Review',
    damageTypes: 'Damage Types to Detect',
  },
  damageDetection: {
    scratches: 'Scratches',
    dents: 'Dents',
    cracks: 'Cracks',
    rust: 'Rust',
    paint: 'Paint Damage',
    structural: 'Structural Damage',
    glass: 'Glass Damage',
  },
  qualityControl: {
    blurDetection: 'Blur Detection',
    lightingCheck: 'Lighting Check',
    angleVerification: 'Angle Verification',
    completenessCheck: 'Completeness Check',
  },
  messages: {
    configSaved: 'Configuration saved successfully',
    configError: 'Failed to save configuration',
  },
} as const;
