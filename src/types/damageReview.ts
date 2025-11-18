export interface DamageImage {
  id: string;
  reportId: string;
  sectionId: string;
  partName: string;
  imageUrl: string;
  imageType: 'damage' | 'vin' | 'mileage' | 'general';
  orderIndex: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DamageStatus = 'pending' | 'validated' | 'non_billable' | 'false_positive';
export type DamageSeverity = 0 | 1 | 2 | 3 | 4 | 5;

export interface Damage {
  id: string;
  reportId: string;
  imageId: string;
  damageGroupId: string;
  sectionId: string;
  partName: string;
  location: string;
  damageType: string;
  severity: DamageSeverity;
  status: DamageStatus;
  boundingBox: BoundingBox;
  confidenceScore: number;
  reviewedBy?: string;
  reviewedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewSectionStatus = 'not_started' | 'in_progress' | 'completed';

export interface DamageReviewSession {
  id: string;
  reportId: string;
  reviewerId: string;
  sectionId: string;
  sectionStatus: ReviewSectionStatus;
  startedAt: string;
  completedAt?: string;
  comments: string;
}

export interface VehicleMetadata {
  id: string;
  vehicleId: string;
  reportId?: string;
  vin: string;
  vinImageId?: string;
  mileage: number;
  mileageImageId?: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DamageReviewState {
  currentSectionId: string | null;
  currentPartName: string | null;
  currentImageId: string | null;
  currentDamageId: string | null;
  isDrawingMode: boolean;
  selectedDamageIds: string[];
}

export interface PartReviewInfo {
  partName: string;
  sectionId: string;
  totalDamages: number;
  reviewedDamages: number;
  images: DamageImage[];
  damages: Damage[];
  isComplete: boolean;
}

export interface SectionReviewInfo {
  sectionId: string;
  sectionName: string;
  parts: PartReviewInfo[];
  totalParts: number;
  reviewedParts: number;
  totalDamages: number;
  reviewedDamages: number;
  status: ReviewSectionStatus;
  isComplete: boolean;
}

// Vehicle part configurations by section
export const SECTION_PARTS: Record<string, string[]> = {
  'exterior': [
    'Front Bumper',
    'Rear Bumper',
    'Rear Quarter Panel'
  ],
  'exterior-body': [
    'Hood',
    'Roof',
    'Driver Side Door',
    'Passenger Side Door',
    'Front Left Door',
    'Front Right Door',
    'Rear Left Door',
    'Rear Right Door',
    'Front Left Fender',
    'Front Right Fender',
    'Rear Left Quarter Panel',
    'Rear Right Quarter Panel',
    'Trunk/Tailgate',
    'Grille',
    'Rocker Panel Left',
    'Rocker Panel Right'
  ],
  'tires': [
    'Front Left Tire',
    'Front Right Tire',
    'Rear Left Tire',
    'Rear Right Tire',
    'Spare Tire'
  ],
  'rims': [
    'Front Left Rim',
    'Front Right Rim',
    'Rear Left Rim',
    'Rear Right Rim'
  ],
  'glazing': [
    'Windshield',
    'Rear Window',
    'Front Left Window',
    'Front Right Window',
    'Rear Left Window',
    'Rear Right Window',
    'Sunroof',
    'Left Mirror',
    'Right Mirror',
    'Rear View Mirror'
  ],
  'interior': [
    'Front Left Seat',
    'Front Right Seat',
    'Rear Left Seat',
    'Rear Right Seat',
    'Dashboard',
    'Dashboard Lights',
    'Steering Wheel',
    'Center Console',
    'Door Panels',
    'Headliner',
    'Carpet',
    'Trunk Interior'
  ],
  'motor': [
    'Engine Block',
    'Radiator',
    'Battery',
    'Air Filter',
    'Oil System',
    'Coolant System',
    'Belts',
    'Hoses',
    'Spark Plugs',
    'Transmission'
  ]
};

// Damage locations
export const DAMAGE_LOCATIONS = [
  'Front',
  'Rear',
  'Left',
  'Right',
  'Top',
  'Bottom',
  'Center',
  'Front Left',
  'Front Right',
  'Rear Left',
  'Rear Right',
  'Upper Left',
  'Upper Right',
  'Lower Left',
  'Lower Right',
  'Edge',
  'Corner'
];

// Damage types by part category
export const DAMAGE_TYPES: Record<string, string[]> = {
  body: [
    'Scratch',
    'Dent',
    'Chip',
    'Crack',
    'Rust',
    'Paint Damage',
    'Missing Part',
    'Deformation',
    'Hole',
    'Corrosion'
  ],
  rim: [
    'Curb Rash',
    'Bent',
    'Crack',
    'Corrosion',
    'Missing Center Cap',
    'Scratch'
  ],
  tire: [
    'Tread Wear',
    'Sidewall Damage',
    'Bulge',
    'Cut',
    'Puncture',
    'Dry Rot',
    'Uneven Wear',
    'Exposed Cord'
  ],
  glass: [
    'Chip',
    'Crack',
    'Shattered',
    'Scratch',
    'Delamination',
    'Missing'
  ],
  interior: [
    'Tear',
    'Stain',
    'Burn',
    'Wear',
    'Missing Component',
    'Broken',
    'Crack',
    'Discoloration'
  ],
  motor: [
    'Leak',
    'Corrosion',
    'Wear',
    'Crack',
    'Missing Component',
    'Damage',
    'Malfunction'
  ]
};

// Get damage types for a specific section
export function getDamageTypesForSection(sectionId: string): string[] {
  const sectionToDamageMap: Record<string, keyof typeof DAMAGE_TYPES> = {
    'exterior': 'body',
    'exterior-body': 'body',
    'rims': 'rim',
    'tires': 'tire',
    'glazing': 'glass',
    'interior': 'interior',
    'motor': 'motor'
  };

  const damageKey = sectionToDamageMap[sectionId];
  return damageKey ? DAMAGE_TYPES[damageKey] : DAMAGE_TYPES.body;
}

// Severity color mapping
export function getSeverityColor(severity: DamageSeverity): string {
  switch (severity) {
    case 0:
      return '#000000'; // black
    case 1:
    case 2:
      return '#10B981'; // green
    case 3:
      return '#FBBF24'; // yellow
    case 4:
      return '#F97316'; // orange
    case 5:
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}

// Severity label mapping
export function getSeverityLabel(severity: DamageSeverity): string {
  switch (severity) {
    case 0:
      return 'No Damage';
    case 1:
      return 'Very Minor';
    case 2:
      return 'Minor';
    case 3:
      return 'Moderate';
    case 4:
      return 'Significant';
    case 5:
      return 'Severe';
    default:
      return 'Unknown';
  }
}

// Status color mapping for badges
export function getStatusColor(status: DamageStatus): string {
  switch (status) {
    case 'validated':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'non_billable':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'false_positive':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
}

// Status color mapping for bounding boxes
export function getStatusBorderColor(status: DamageStatus): string {
  switch (status) {
    case 'validated':
      return '#10B981'; // green
    case 'non_billable':
      return '#3B82F6'; // blue
    case 'false_positive':
      return '#6B7280'; // gray
    case 'pending':
    default:
      return '#FBBF24'; // yellow
  }
}

// Status label mapping
export function getStatusLabel(status: DamageStatus): string {
  switch (status) {
    case 'validated':
      return 'Actual Damage';
    case 'non_billable':
      return 'Non-Billable';
    case 'false_positive':
      return 'False Positive';
    case 'pending':
    default:
      return 'Pending Review';
  }
}
