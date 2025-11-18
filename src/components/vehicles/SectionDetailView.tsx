import React from 'react';
import { InspectionSection, Vehicle, InspectionStatus, SectionStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle, AlertTriangle, Info, Camera, FileText, CreditCard as Edit3, Save, X } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { WheelDiagramView } from './WheelDiagramView';

interface SectionDetailViewProps {
  section: InspectionSection;
  vehicle: Vehicle;
  isVehicleInfo?: boolean;
}

export const SectionDetailView: React.FC<SectionDetailViewProps> = ({
  section,
  vehicle,
  isVehicleInfo = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState(vehicle);
  const [activeTab, setActiveTab] = useState<'analysis' | 'media'>('analysis');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving vehicle data:', editedVehicle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedVehicle(vehicle);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditedVehicle(prev => ({ ...prev, [field]: value }));
  };

  const getSeverityIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'major_issues':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'minor_issues':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get section-specific content based on section ID
  const getSectionContent = () => {
    switch (section.id) {
      case 'section-body':
        return {
          title: 'Carrosserie',
          sourcePhotos: [
            { name: 'Vue avant', url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 94%' },
            { name: 'Vue arrière', url: 'https://images.pexels.com/photos/1213294/pexels-photo-1213294.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 91%' },
            { name: 'Côté gauche', url: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 89%' },
            { name: 'Côté droit', url: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 92%' }
          ],
          detectedData: [
            { label: 'Pare-chocs avant', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Pare-chocs arrière', value: 'Rayure mineure', source: 'IA détecté', editable: true, severity: 'low', cost: 200 },
            { label: 'Panneaux latéraux', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Capot', value: 'Bon état', source: 'IA détecté', editable: true }
          ]
        };
      case 'section-rim':
        return {
          title: 'Jantes',
          sourcePhotos: [
            { name: 'Jante avant gauche', url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 96%' },
            { name: 'Jante avant droite', url: 'https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 94%' },
            { name: 'Jante arrière gauche', url: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 93%' },
            { name: 'Jante arrière droite', url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 95%' }
          ],
          detectedData: [
            { label: 'Type de jante', value: 'Alliage OEM', source: 'IA détecté', editable: true },
            { label: 'Taille', value: '17 pouces', source: 'IA détecté', editable: true },
            { label: 'État général', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Défauts détectés', value: 'Aucun', source: 'IA détecté', editable: true }
          ],
          wheelData: [
            { position: 'front-left', imageUrl: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 96%', damaged: false, material: 'Aluminium', rimType: 'OEM Alloy', size: '17"' },
            { position: 'front-right', imageUrl: 'https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 94%', damaged: true, damageType: 'Scratches on surface', material: 'Aluminium', rimType: 'OEM Alloy', size: '17"' },
            { position: 'rear-left', imageUrl: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 93%', damaged: false, material: 'Aluminium', rimType: 'OEM Alloy', size: '17"' },
            { position: 'rear-right', imageUrl: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 95%', damaged: false, material: 'Aluminium', rimType: 'OEM Alloy', size: '17"' }
          ]
        };
      case 'section-tires':
        return {
          title: 'Pneus',
          sourcePhotos: [
            { name: 'Pneu avant gauche', url: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 95%' },
            { name: 'Pneu avant droit', url: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 93%' },
            { name: 'Pneu arrière gauche', url: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 94%' },
            { name: 'Pneu arrière droit', url: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 96%' }
          ],
          detectedData: [
            { label: 'Marque', value: 'Michelin', source: 'IA détecté', editable: true },
            { label: 'Taille', value: '205/55 R17', source: 'IA détecté', editable: true },
            { label: 'État général', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Défauts détectés', value: 'Usure avant gauche', source: 'IA détecté', editable: true }
          ],
          wheelData: [
            { position: 'front-left', imageUrl: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 95%', damaged: true, damageType: 'Excessive wear (3mm)', brand: 'Michelin', size: '205/55 R17', dot: '2420' },
            { position: 'front-right', imageUrl: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 93%', damaged: false, brand: 'Michelin', size: '205/55 R17', dot: '2420' },
            { position: 'rear-left', imageUrl: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 94%', damaged: false, brand: 'Michelin', size: '205/55 R17', dot: '2420' },
            { position: 'rear-right', imageUrl: 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=400', confidence: 'IA: 96%', damaged: false, brand: 'Michelin', size: '205/55 R17', dot: '2420' }
          ]
        };
      case 'section-interior':
        return {
          title: 'Intérieur',
          sourcePhotos: [
            { name: 'Sièges avant', url: 'https://images.pexels.com/photos/1213294/pexels-photo-1213294.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 88%' },
            { name: 'Sièges arrière', url: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 90%' },
            { name: 'Tableau de bord', url: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 92%' },
            { name: 'Moquette', url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 85%' }
          ],
          detectedData: [
            { label: 'Sièges avant', value: 'Usure légère', source: 'IA détecté', editable: true, severity: 'medium', cost: 500 },
            { label: 'Sièges arrière', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Tableau de bord', value: 'Bon état', source: 'IA détecté', editable: true },
            { label: 'Moquette', value: 'Tache légère', source: 'IA détecté', editable: true, severity: 'low', cost: 150 }
          ]
        };
      default:
        return {
          title: section.name,
          sourcePhotos: [
            { name: 'Photo 1', url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 90%' },
            { name: 'Photo 2', url: 'https://images.pexels.com/photos/1213294/pexels-photo-1213294.jpeg?auto=compress&cs=tinysrgb&w=300', confidence: 'IA: 88%' }
          ],
          detectedData: [
            { label: 'État général', value: 'Bon état', source: 'IA détecté', editable: true }
          ]
        };
    }
  };

  const sectionContent = getSectionContent();
  const damagedItems = section.items.filter(item => item.status !== 'passed');
  const totalCost = damagedItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  const hasTabMenu = section.id === 'section-body' || section.id === 'section-interior';
  const isWheelSection = section.id === 'section-rim' || section.id === 'section-tires';

  if (isWheelSection && sectionContent.wheelData) {
    return (
      <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm transition-colors">
              ← Retour
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sectionContent.title}</h1>
                <div className="mt-1">
                  {damagedItems.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-medium">
                        {damagedItems.length} element{damagedItems.length > 1 ? 's' : ''}
                      </span>
                      {totalCost > 0 && (
                        <span className="text-red-600 font-bold">
                          {formatCurrency(totalCost)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-green-600 font-medium">All elements OK</span>
                  )}
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          </div>
        </div>

        <WheelDiagramView
          type={section.id === 'section-rim' ? 'rim' : 'tire'}
          wheels={sectionContent.wheelData}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm transition-colors">
            ← Retour
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sectionContent.title}</h1>
              <div className="mt-1">
                {damagedItems.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium">
                      {damagedItems.length} element{damagedItems.length > 1 ? 's' : ''}
                    </span>
                    {totalCost > 0 && (
                      <span className="text-red-600 font-bold">
                        {formatCurrency(totalCost)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-green-600 font-medium">All elements OK</span>
                )}
              </div>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {hasTabMenu && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('analysis')}
              className={clsx(
                'pb-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'analysis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={clsx(
                'pb-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'media'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Pictures/Videos
            </button>
          </nav>
        </div>
      )}

      {hasTabMenu && activeTab === 'media' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sectionContent.sourcePhotos.map((photo, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  {photo.confidence}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900">{photo.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {!hasTabMenu && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Photos sources</h3>
            </div>

            <div className="space-y-4">
              {sectionContent.sourcePhotos.map((photo, index) => (
                <div key={index}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{photo.name}</p>
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {photo.confidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Data Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Données extraites</h3>
          </div>

          <div className="space-y-4">
            {sectionContent.detectedData.map((data, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{data.label}</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{data.value}</span>
                    {data.cost && (
                      <span className="text-xs text-red-600 font-medium">
                        {formatCurrency(data.cost)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-green-600 font-medium">{data.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Validation</h3>
          </div>

          <div className="space-y-4">
            {/* Validation Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Section validée</span>
              </div>
              <p className="text-sm text-green-700">
                Toutes les données de cette section ont été vérifiées et validées.
              </p>
            </div>

            {/* Validation Actions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Actions de validation</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  Confirmer les données
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                  Signaler une erreur
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
  // Vehicle Information View
  if (isVehicleInfo || section.id === 'vehicle-info') {
    return (
      <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm transition-colors">
              ← Retour
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Informations du véhicule</h1>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Source Photos Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Photos sources</h3>
            </div>
            
            <div className="space-y-4">
              {/* License Plate Photo */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Plaque d'immatriculation</p>
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="License plate"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    OCR: 98%
                  </div>
                </div>
              </div>

              {/* VIN Photo */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Numéro VIN</p>
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="VIN number"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    OCR: 95%
                  </div>
                </div>
              </div>

              {/* Exterior Photo for Make/Model */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Vue extérieure</p>
                <div className="relative">
                  <img
                    src={vehicle.imageUrl}
                    alt="Vehicle exterior"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    IA: 92%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Data Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Données extraites</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedVehicle.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>{vehicle.make}</span>
                    <span className="text-xs text-green-600 font-medium">IA détecté</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modèle</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedVehicle.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>{vehicle.model}</span>
                    <span className="text-xs text-green-600 font-medium">IA détecté</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedVehicle.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>{vehicle.year}</span>
                    <span className="text-xs text-blue-600 font-medium">Document</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Immatriculation</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedVehicle.registration}
                    onChange={(e) => handleInputChange('registration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>{vehicle.registration}</span>
                    <span className="text-xs text-green-600 font-medium">OCR détecté</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kilométrage</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedVehicle.mileage}
                    onChange={(e) => handleInputChange('mileage', parseInt(e.target.value.replace(/\D/g, '')))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                    <span className="text-xs text-green-600 font-medium">OCR détecté</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue="Blanc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>Blanc</span>
                    <span className="text-xs text-green-600 font-medium">IA détecté</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de carburant</label>
                {isEditing ? (
                  <select
                    defaultValue="Diesel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>Diesel</span>
                    <span className="text-xs text-blue-600 font-medium">Document</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue="VF1FC000123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                    <span>VF1FC000123456789</span>
                    <span className="text-xs text-green-600 font-medium">OCR détecté</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validation Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Validation</h3>
            </div>

            <div className="space-y-4">
              {/* Validation Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Informations validées</span>
                </div>
                <p className="text-sm text-green-700">
                  Toutes les informations du véhicule ont été vérifiées et validées.
                </p>
              </div>

              {/* AI Confidence Scores */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Scores de confiance IA</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plaque d'immatriculation</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">VIN</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Marque/Modèle</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">92%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Actions de validation</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Confirmer toutes les données
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                    Signaler une erreur
                  </button>
                </div>
              </div>

              {/* Data Sources Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sources des données</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">3 photos analysées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">1 document traité</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consistency Checks */}
        <div className="mt-4 md:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Vérifications de cohérence</h4>
          </div>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>VIN cohérent avec la marque et le modèle détectés</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Plaque d'immatriculation correspond au format français</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Année cohérente avec le modèle du véhicule</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};