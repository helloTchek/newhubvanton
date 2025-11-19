import { 
  Company, 
  Vehicle, 
  VehicleInspectionReport, 
  InspectionSection, 
  User,
  VehicleStatus,
  InspectionStatus 
} from '../types';

// Mock Companies Data
export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'AutoCorp Solutions',
    motherCompany: 'GlobalAuto Holdings',
    address: '123 Business Ave, Paris, France',
    email: 'contact@autocorp.com',
    phone: '+33 1 23 45 67 89',
    vehicleCount: 45,
    logo: 'https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    id: 'comp-2',
    name: 'Fleet Management Pro',
    address: '456 Industrial Blvd, Lyon, France',
    email: 'hello@fleetpro.com',
    phone: '+33 4 76 54 32 10',
    vehicleCount: 128,
    logo: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    id: 'comp-3',
    name: 'Urban Transport Ltd',
    motherCompany: 'CityMove Group',
    address: '789 Transport St, Marseille, France',
    email: 'info@urbantransport.com',
    phone: '+33 4 91 12 34 56',
    vehicleCount: 73,
    logo: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=100'
  }
];

// Mock Vehicles Data
export const mockVehicles: Vehicle[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    registration: 'AB-123-CD',
    make: 'Renault',
    model: 'Clio',
    year: 2021,
    mileage: 25000,
    companyId: '11111111-1111-1111-1111-111111111111',
    companyName: 'AutoCorp Solutions',
    status: 'to_review' as VehicleStatus,
    inspectionDate: '2024-01-15T10:30:00Z',
    estimatedValue: 18500,
    estimatedCost: 1200,
    imageUrl: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'john.doe@autocorp.com'
  },
  {
    id: 'veh-1',
    registration: 'XY-999-ZZ',
    make: 'Peugeot',
    model: '208',
    year: 2021,
    mileage: 28000,
    companyId: 'comp-1',
    companyName: 'AutoCorp Solutions',
    status: 'inspected' as VehicleStatus,
    inspectionDate: '2024-01-15T10:30:00Z',
    estimatedValue: 17500,
    estimatedCost: 950,
    imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/893894/pexels-photo-893894.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    customerEmail: 'jane.smith@autocorp.com'
  },
  {
    id: 'veh-2',
    registration: 'EF-456-GH',
    make: 'Peugeot',
    model: '308',
    year: 2020,
    mileage: 38000,
    companyId: 'comp-2',
    companyName: 'Fleet Management Pro',
    status: 'to_review' as VehicleStatus,
    inspectionDate: '2024-01-16T14:15:00Z',
    estimatedValue: 22000,
    estimatedCost: 850,
    imageUrl: 'https://images.pexels.com/photos/1213294/pexels-photo-1213294.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'sarah.wilson@fleetpro.com'
  },
  {
    id: 'veh-3',
    registration: 'IJ-789-KL',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    mileage: 52000,
    companyId: 'comp-1',
    companyName: 'AutoCorp Solutions',
    status: 'inspection_in_progress' as VehicleStatus,
    estimatedValue: 19500,
    estimatedCost: 0,
    imageUrl: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'mike.johnson@autocorp.com'
  },
  {
    id: 'veh-4',
    registration: 'MN-012-OP',
    make: 'BMW',
    model: '320d',
    year: 2022,
    mileage: 15000,
    companyId: 'comp-3',
    companyName: 'Urban Transport Ltd',
    status: 'inspected' as VehicleStatus,
    inspectionDate: '2024-01-14T09:45:00Z',
    estimatedValue: 35000,
    estimatedCost: 2100,
    imageUrl: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    customerEmail: 'emma.brown@urbantransport.com'
  },
  {
    id: 'veh-5',
    registration: 'MN-333-OP',
    make: 'BMW',
    model: '320d',
    year: 2022,
    mileage: 15000,
    companyId: 'comp-3',
    companyName: 'Urban Transport Ltd',
    status: 'archived' as VehicleStatus,
    inspectionDate: '2024-01-14T09:45:00Z',
    estimatedValue: 35000,
    estimatedCost: 2100,
    imageUrl: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'emma.white@urbantransport.com'
  },
  {
    id: 'veh-6',
    registration: 'MN-333-TT',
    make: 'BMW',
    model: '320d',
    year: 2022,
    mileage: 15000,
    companyId: 'comp-3',
    companyName: 'Urban Transport Ltd',
    status: 'inspection_in_progress' as VehicleStatus,
    inspectionDate: '2024-01-14T09:45:00Z',
    estimatedValue: 35000,
    estimatedCost: 2100,
    imageUrl: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'emma.red@urbantransport.com'
  },
  {
    id: 'veh-7',
    registration: 'AA-333-TT',
    make: 'BMW',
    model: '320d',
    year: 2022,
    mileage: 15000,
    companyId: 'comp-3',
    companyName: 'Urban Transport Ltd',
    status: 'chased_up_1' as VehicleStatus,
    inspectionDate: '2024-01-14T09:45:00Z',
    estimatedValue: 35000,
    estimatedCost: 2100,
    imageUrl: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'emma.blu@urbantransport.com'
  },
  {
    id: 'veh-8',
    registration: 'FF-333-TT',
    make: 'BMW',
    model: '320d',
    year: 2022,
    mileage: 15000,
    companyId: 'comp-3',
    companyName: 'Urban Transport Ltd',
    status: 'link_sent' as VehicleStatus,
    inspectionDate: '2024-01-14T09:45:00Z',
    estimatedValue: 35000,
    estimatedCost: 2100,
    imageUrl: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    customerEmail: 'emma.yellow@urbantransport.com'
  }

];

// Mock Inspection Sections
export const mockInspectionSections: InspectionSection[] = [
  {
    id: 'vehicle-info',
    name: 'Vehicle Information',
    status: 'passed' as InspectionStatus,
    icon: 'ℹ️',
    sectionStatus: 'reviewed',
    isVisible: true,
    configuration: {
      requiresImages: false,
      requiresAIAnalysis: false,
      requiresHumanReview: true,
      isImagesMandatory: false,
      isAIAnalysisMandatory: false,
      isHumanReviewMandatory: true
    },
    items: [
      { id: 'vehicle-1', name: 'Vehicle Registration', status: 'passed' as InspectionStatus },
      { id: 'vehicle-2', name: 'Vehicle Identification', status: 'passed' as InspectionStatus },
      { id: 'vehicle-3', name: 'Mileage Verification', status: 'passed' as InspectionStatus },
      { id: 'vehicle-4', name: 'Documentation Check', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-body',
    name: 'Car Body',
    status: 'minor_issues' as InspectionStatus,
    icon: '🚗',
    sectionStatus: 'needs_review',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: true,
      isImagesMandatory: true,
      isAIAnalysisMandatory: true,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'body-1', name: 'Front Bumper', status: 'passed' as InspectionStatus },
      { id: 'body-2', name: 'Rear Bumper', status: 'minor_issues' as InspectionStatus, severity: 'low', estimatedCost: 200 },
      { id: 'body-3', name: 'Side Panels', status: 'passed' as InspectionStatus },
      { id: 'body-4', name: 'Hood', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-rim',
    name: 'Rim',
    status: 'passed' as InspectionStatus,
    icon: '⚡',
    sectionStatus: 'reviewed',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: false,
      isImagesMandatory: true,
      isAIAnalysisMandatory: true,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'rim-1', name: 'Front Left Rim', status: 'passed' as InspectionStatus },
      { id: 'rim-2', name: 'Front Right Rim', status: 'passed' as InspectionStatus },
      { id: 'rim-3', name: 'Rear Left Rim', status: 'passed' as InspectionStatus },
      { id: 'rim-4', name: 'Rear Right Rim', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-interior',
    name: 'Interior',
    status: 'major_issues' as InspectionStatus,
    icon: '🪑',
    sectionStatus: 'needs_review',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: true,
      isImagesMandatory: true,
      isAIAnalysisMandatory: true,
      isHumanReviewMandatory: true
    },
    items: [
      { id: 'interior-1', name: 'Front Seats', status: 'minor_issues' as InspectionStatus, severity: 'medium', estimatedCost: 500 },
      { id: 'interior-2', name: 'Rear Seats', status: 'passed' as InspectionStatus },
      { id: 'interior-3', name: 'Carpet', status: 'major_issues' as InspectionStatus, severity: 'high', estimatedCost: 800 },
      { id: 'interior-4', name: 'Door Panels', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-tires',
    name: 'Tires',
    status: 'minor_issues' as InspectionStatus,
    icon: '🛞',
    sectionStatus: 'inspect',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: false,
      isImagesMandatory: true,
      isAIAnalysisMandatory: true,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'tire-1', name: 'Front Left Tire', status: 'minor_issues' as InspectionStatus, severity: 'medium', estimatedCost: 150 },
      { id: 'tire-2', name: 'Front Right Tire', status: 'passed' as InspectionStatus },
      { id: 'tire-3', name: 'Rear Left Tire', status: 'passed' as InspectionStatus },
      { id: 'tire-4', name: 'Rear Right Tire', status: 'minor_issues' as InspectionStatus, severity: 'low', estimatedCost: 100 }
    ]
  },
  {
    id: 'section-motor',
    name: 'Motor',
    status: 'passed' as InspectionStatus,
    icon: '🔧',
    sectionStatus: 'missing_data',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: true,
      isImagesMandatory: true,
      isAIAnalysisMandatory: false,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'motor-1', name: 'Engine Block', status: 'passed' as InspectionStatus },
      { id: 'motor-2', name: 'Oil Level', status: 'passed' as InspectionStatus },
      { id: 'motor-3', name: 'Coolant System', status: 'passed' as InspectionStatus },
      { id: 'motor-4', name: 'Battery', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-glass',
    name: 'Glass',
    status: 'minor_issues' as InspectionStatus,
    icon: '🪟',
    sectionStatus: 'reviewed',
    isVisible: true,
    configuration: {
      requiresImages: true,
      requiresAIAnalysis: true,
      requiresHumanReview: false,
      isImagesMandatory: true,
      isAIAnalysisMandatory: true,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'glass-1', name: 'Windshield', status: 'minor_issues' as InspectionStatus, severity: 'low', estimatedCost: 300 },
      { id: 'glass-2', name: 'Rear Window', status: 'passed' as InspectionStatus },
      { id: 'glass-3', name: 'Side Windows', status: 'passed' as InspectionStatus },
      { id: 'glass-4', name: 'Mirrors', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-documents',
    name: 'Documents',
    status: 'passed' as InspectionStatus,
    icon: '📄',
    sectionStatus: 'inspect',
    isVisible: true,
    configuration: {
      requiresImages: false,
      requiresAIAnalysis: false,
      requiresHumanReview: true,
      isImagesMandatory: false,
      isAIAnalysisMandatory: false,
      isHumanReviewMandatory: true
    },
    items: [
      { id: 'doc-1', name: 'Registration Papers', status: 'passed' as InspectionStatus },
      { id: 'doc-2', name: 'Insurance', status: 'passed' as InspectionStatus },
      { id: 'doc-3', name: 'Service History', status: 'passed' as InspectionStatus },
      { id: 'doc-4', name: 'Owner Manual', status: 'passed' as InspectionStatus }
    ]
  },
  {
    id: 'section-declaration',
    name: 'Declaration',
    status: 'passed' as InspectionStatus,
    icon: '📋',
    sectionStatus: 'reviewed',
    isVisible: true,
    configuration: {
      requiresImages: false,
      requiresAIAnalysis: false,
      requiresHumanReview: true,
      isImagesMandatory: false,
      isAIAnalysisMandatory: false,
      isHumanReviewMandatory: false
    },
    items: [
      { id: 'decl-1', name: 'Damage Declaration', status: 'passed' as InspectionStatus },
      { id: 'decl-2', name: 'Previous Repairs', status: 'passed' as InspectionStatus },
      { id: 'decl-3', name: 'Accident History', status: 'passed' as InspectionStatus },
      { id: 'decl-4', name: 'Maintenance Records', status: 'passed' as InspectionStatus }
    ]
  }
];

// Mock Company Configurations
export const mockCompanyConfigurations: Record<string, CompanyConfiguration> = {
  'comp-1': {
    id: 'config-1',
    companyId: 'comp-1',
    visibleSections: ['section-body', 'section-rim', 'section-interior', 'section-tires', 'section-motor', 'section-glass', 'section-documents', 'section-declaration'],
    sectionConfigurations: {
      'section-body': {
        requiresImages: true,
        requiresAIAnalysis: true,
        requiresHumanReview: true,
        isImagesMandatory: true,
        isAIAnalysisMandatory: true,
        isHumanReviewMandatory: false
      },
      'section-motor': {
        requiresImages: true,
        requiresAIAnalysis: true,
        requiresHumanReview: true,
        isImagesMandatory: true,
        isAIAnalysisMandatory: false,
        isHumanReviewMandatory: false
      }
    }
  }
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@tchek.ai',
    name: 'John Admin',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    id: 'user-2',
    email: 'inspector@tchek.ai',
    name: 'Sarah Inspector',
    role: 'inspector',
    companyId: 'comp-1',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
  }
];

// Mock Vehicle Reports
export const mockVehicleReports: Record<string, VehicleInspectionReport> = {
  '22222222-2222-2222-2222-222222222222': {
    id: '33333333-3333-3333-3333-333333333333',
    vehicleId: '22222222-2222-2222-2222-222222222222',
    tchekId: 'TCK-2024-001',
    reportDate: '2024-01-15T10:30:00Z',
    photosDate: '2024-01-15T10:45:00Z',
    inspector: {
      name: 'Sarah Inspector',
      email: 'inspector@tchek.ai',
      phone: '+33 6 12 34 56 78',
      company: 'Tchek.ai'
    },
    customer: {
      name: 'John Doe',
      email: 'john.doe@autocorp.com',
      phone: '+33 6 98 76 54 32',
      company: 'AutoCorp Solutions'
    },
    vehicle: mockVehicles[0],
    inspectionOverview: mockInspectionSections,
    totalCost: 1200,
    reportStatus: 'completed'
  },
  'veh-1': {
    id: 'report-1',
    vehicleId: 'veh-1',
    tchekId: 'TCK-2024-002',
    reportDate: '2024-01-15T10:30:00Z',
    photosDate: '2024-01-15T10:45:00Z',
    inspector: {
      name: 'Sarah Inspector',
      email: 'inspector@tchek.ai',
      phone: '+33 6 12 34 56 78',
      company: 'Tchek.ai'
    },
    customer: {
      name: 'Jane Smith',
      email: 'jane.smith@autocorp.com',
      phone: '+33 6 11 22 33 44',
      company: 'AutoCorp Solutions'
    },
    vehicle: mockVehicles[1],
    inspectionOverview: mockInspectionSections,
    totalCost: 950,
    reportStatus: 'completed'
  }
};