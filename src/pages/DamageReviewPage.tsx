import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ImageCanvas } from '../components/damageReview/ImageCanvas';
import { DamageReviewService } from '../services/damageReviewService';
import {
  Damage,
  DamageImage,
  SectionReviewInfo,
  DamageStatus,
  BoundingBox,
  getSeverityLabel,
  getStatusLabel,
  getSeverityColor,
  SECTION_PARTS,
  DAMAGE_LOCATIONS,
  getDamageTypesForSection
} from '../types/damageReview';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, Save, Check, X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const DamageReviewPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [sections, setSections] = useState<SectionReviewInfo[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentPartName, setCurrentPartName] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<DamageImage[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isEditingDamage, setIsEditingDamage] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Damage>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    if (reportId) {
      loadSections();
    }
  }, [reportId]);

  // Handle section query parameter
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam && sections.length > 0) {
      const section = sections.find(s => s.sectionId === sectionParam);
      if (section) {
        setExpandedSections(prev => new Set(prev).add(sectionParam));

        const firstPart = section.parts[0];
        if (firstPart && !currentSectionId) {
          setCurrentSectionId(sectionParam);
          setCurrentPartName(firstPart.partName);
        }
      }
    }
  }, [searchParams, sections]);

  const loadSections = async () => {
    if (!reportId) return;

    try {
      const sectionIds = Object.keys(SECTION_PARTS);
      const sectionsData = await Promise.all(
        sectionIds.map(id => DamageReviewService.getSectionReviewInfo(reportId, id))
      );
      setSections(sectionsData.filter(s => s.totalDamages > 0));
    } catch (error) {
      console.error('Failed to load sections:', error);
      toast.error('Failed to load damage data');
    }
  };

  const loadPartData = async (sectionId: string, partName: string) => {
    if (!reportId) return;

    try {
      const [partImages, partDamages] = await Promise.all([
        DamageReviewService.getImagesForPart(reportId, sectionId, partName),
        DamageReviewService.getDamagesForPart(reportId, sectionId, partName)
      ]);

      setImages(partImages);
      setDamages(partDamages);
      setCurrentImageIndex(0);
      setSelectedDamageId(null);
    } catch (error) {
      console.error('Failed to load part data:', error);
      toast.error('Failed to load part data');
    }
  };

  useEffect(() => {
    if (currentSectionId && currentPartName) {
      loadPartData(currentSectionId, currentPartName);
    }
  }, [currentSectionId, currentPartName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedDamageId || isEditingDamage) return;

      const currentDamages = damages.filter(d => d.imageId === images[currentImageIndex]?.id);
      const currentIndex = currentDamages.findIndex(d => d.id === selectedDamageId);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < currentDamages.length - 1) {
            setSelectedDamageId(currentDamages[currentIndex + 1].id);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedDamageId(currentDamages[currentIndex - 1].id);
          }
          break;
        case ' ':
          e.preventDefault();
          cycleStatus();
          break;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            e.preventDefault();
            handleNextImage();
            break;
          case 'v':
            e.preventDefault();
            handleNextPart();
            break;
          case 'd':
            e.preventDefault();
            handleDismissAllOnPart();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDamageId, damages, currentImageIndex, images, isEditingDamage]);

  // Damage operations
  const cycleStatus = async () => {
    if (!selectedDamageId || !user) return;

    const damage = damages.find(d => d.id === selectedDamageId);
    if (!damage) return;

    const statuses: DamageStatus[] = ['validated', 'non_billable', 'false_positive'];
    const currentIndex = statuses.indexOf(damage.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await DamageReviewService.updateDamageStatus(selectedDamageId, nextStatus, user.id);
      setDamages(prev => prev.map(d =>
        d.id === selectedDamageId ? { ...d, status: nextStatus } : d
      ));
      toast.success(`Status changed to ${getStatusLabel(nextStatus)}`);
    } catch (error) {
      toast.error('Failed to update damage status');
    }
  };

  const handleUpdateDamage = async () => {
    if (!selectedDamageId || !user) return;

    try {
      const updated = await DamageReviewService.updateDamage(selectedDamageId, {
        ...editForm,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      });
      setDamages(prev => prev.map(d => d.id === selectedDamageId ? updated : d));
      setIsEditingDamage(false);
      toast.success('Damage updated successfully');
    } catch (error) {
      toast.error('Failed to update damage');
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setSelectedDamageId(null);
    }
  };

  const handleNextPart = async () => {
    if (!currentSectionId) return;

    const section = sections.find(s => s.sectionId === currentSectionId);
    if (!section) return;

    const currentPartIndex = section.parts.findIndex(p => p.partName === currentPartName);
    if (currentPartIndex < section.parts.length - 1) {
      setCurrentPartName(section.parts[currentPartIndex + 1].partName);
    }
  };

  const handleDismissAllOnPart = async () => {
    if (!reportId || !currentSectionId || !currentPartName || !user) return;

    if (confirm('Are you sure you want to mark all damages on this part as false positives?')) {
      try {
        await DamageReviewService.markPartDamagesAsFalsePositive(
          reportId,
          currentSectionId,
          currentPartName,
          user.id
        );

        // Reload sections to update the checkmark
        await loadSections();

        toast.success('All damages marked as false positive');

        // Check if all damages across all sections are reviewed
        const allDamages = await DamageReviewService.getDamagesForReport(reportId);
        const allReviewed = allDamages.every(d => d.status !== 'pending');

        if (allReviewed) {
          // All damages reviewed - navigate to recap page
          toast.success('All damages reviewed! Redirecting to recap...');
          setTimeout(() => {
            navigate(`/damage-recap/${reportId}`);
          }, 1500);
          return;
        }

        // Move to next part automatically
        const section = sections.find(s => s.sectionId === currentSectionId);
        if (section) {
          const currentPartIndex = section.parts.findIndex(p => p.partName === currentPartName);
          if (currentPartIndex < section.parts.length - 1) {
            // Move to next part in the same section
            setCurrentPartName(section.parts[currentPartIndex + 1].partName);
          } else {
            // Try to move to the first part of the next section
            const currentSectionIndex = sections.findIndex(s => s.sectionId === currentSectionId);
            if (currentSectionIndex < sections.length - 1) {
              const nextSection = sections[currentSectionIndex + 1];
              setCurrentSectionId(nextSection.sectionId);
              setCurrentPartName(nextSection.parts[0]?.partName || null);
              // Expand the next section
              setExpandedSections(prev => new Set([...prev, nextSection.sectionId]));
            }
          }
        }
      } catch (error) {
        toast.error('Failed to update damages');
      }
    }
  };

  const handleValidateAllOnPart = async () => {
    if (!reportId || !currentSectionId || !currentPartName || !user) return;

    try {
      await DamageReviewService.validatePartDamages(
        reportId,
        currentSectionId,
        currentPartName,
        user.id
      );

      // Reload sections to update the checkmark
      await loadSections();

      toast.success('All pending damages validated');

      // Check if all damages across all sections are reviewed
      const allDamages = await DamageReviewService.getDamagesForReport(reportId);
      const allReviewed = allDamages.every(d => d.status !== 'pending');

      if (allReviewed) {
        // All damages reviewed - navigate to recap page
        toast.success('All damages reviewed! Redirecting to recap...');
        setTimeout(() => {
          navigate(`/damage-recap/${reportId}`);
        }, 1500);
        return;
      }

      // Move to next part automatically
      const section = sections.find(s => s.sectionId === currentSectionId);
      if (section) {
        const currentPartIndex = section.parts.findIndex(p => p.partName === currentPartName);
        if (currentPartIndex < section.parts.length - 1) {
          // Move to next part in the same section
          setCurrentPartName(section.parts[currentPartIndex + 1].partName);
        } else {
          // Try to move to the first part of the next section
          const currentSectionIndex = sections.findIndex(s => s.sectionId === currentSectionId);
          if (currentSectionIndex < sections.length - 1) {
            const nextSection = sections[currentSectionIndex + 1];
            setCurrentSectionId(nextSection.sectionId);
            setCurrentPartName(nextSection.parts[0]?.partName || null);
            // Expand the next section
            setExpandedSections(prev => new Set([...prev, nextSection.sectionId]));
          }
        }
      }
    } catch (error) {
      toast.error('Failed to validate damages');
    }
  };

  const handleDrawComplete = async (boundingBox: BoundingBox) => {
    if (!reportId || !currentSectionId || !currentPartName || !user) return;

    const imageId = images[currentImageIndex]?.id;
    if (!imageId) return;

    setEditForm({
      reportId,
      imageId,
      sectionId: currentSectionId,
      partName: currentPartName,
      location: '',
      damageType: '',
      severity: 3,
      status: 'validated',
      boundingBox,
      damageGroupId: crypto.randomUUID(),
      confidenceScore: 1.0,
      notes: ''
    });
    setIsDrawingMode(false);
    setIsEditingDamage(true);
  };

  const handleCreateDamage = async () => {
    if (!user) return;

    try {
      const newDamage = await DamageReviewService.createDamage({
        ...editForm as Omit<Damage, 'id' | 'createdAt' | 'updatedAt'>,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      });
      setDamages(prev => [...prev, newDamage]);
      setIsEditingDamage(false);
      setEditForm({});
      toast.success('Damage created successfully');
    } catch (error) {
      toast.error('Failed to create damage');
    }
  };

  const currentImage = images[currentImageIndex];
  const currentImageDamages = damages.filter(d => d.imageId === currentImage?.id);
  const selectedDamage = damages.find(d => d.id === selectedDamageId);

  if (!reportId) {
    return <div className="p-8 text-center">Invalid report ID</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Damage Review</h1>
            <p className="text-sm text-gray-600">Report ID: {reportId}</p>
          </div>
          <button
            onClick={() => {
              console.log('Return button clicked');
              navigate(-1);
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sections & Parts */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Sections</h2>
            {sections.map(section => {
              const isExpanded = expandedSections.has(section.sectionId);
              return (
                <div key={section.sectionId} className="mb-2">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedSections);
                      if (isExpanded) {
                        newExpanded.delete(section.sectionId);
                      } else {
                        newExpanded.add(section.sectionId);
                      }
                      setExpandedSections(newExpanded);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="font-medium">{section.sectionName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        {section.reviewedDamages}/{section.totalDamages}
                      </span>
                      {section.isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.parts.map(part => (
                        <button
                          key={part.partName}
                          onClick={() => {
                            setCurrentSectionId(section.sectionId);
                            setCurrentPartName(part.partName);
                          }}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            currentPartName === part.partName
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{part.partName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">
                                {part.reviewedDamages}/{part.totalDamages}
                              </span>
                              {part.isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentImage ? (
            <>
              {/* Image Canvas */}
              <div className="flex-1 bg-gray-900 overflow-hidden">
                <ImageCanvas
                  imageUrl={currentImage.imageUrl}
                  damages={currentImageDamages}
                  selectedDamageId={selectedDamageId}
                  onDamageClick={(damage) => setSelectedDamageId(damage.id)}
                  onDrawComplete={handleDrawComplete}
                  isDrawingMode={isDrawingMode}
                />
              </div>

              {/* Bottom Controls */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentImageIndex === 0}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">
                      Image {currentImageIndex + 1} of {images.length}
                    </span>
                    <button
                      onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                      disabled={currentImageIndex === images.length - 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDrawingMode(!isDrawingMode)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDrawingMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Damage
                    </button>
                    <button
                      onClick={handleValidateAllOnPart}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4 inline mr-2" />
                      Validate Part
                    </button>
                    <button
                      onClick={handleDismissAllOnPart}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Dismiss Part
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => {
                    const imgDamages = damages.filter(d => d.imageId === img.id);
                    return (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          idx === currentImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {imgDamages.length > 0 && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            {imgDamages.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a part from the sidebar to begin review
            </div>
          )}
        </div>

        {/* Right Sidebar - Damage Details */}
        {(selectedDamage || isEditingDamage) && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4">
              {isEditingDamage && !selectedDamageId ? 'New Damage' : 'Damage Details'}
            </h3>

            {isEditingDamage ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
                  <select
                    value={editForm.partName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, partName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Part</option>
                    {(SECTION_PARTS[currentSectionId || ''] || []).map(part => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Location</option>
                    {DAMAGE_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
                  <select
                    value={editForm.damageType || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, damageType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Type</option>
                    {getDamageTypesForSection(currentSectionId || '').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editForm.severity || 0}
                    onChange={(e) => setEditForm(prev => ({ ...prev, severity: parseInt(e.target.value) as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status || 'validated'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as DamageStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="validated">Actual Damage</option>
                    <option value="non_billable">Non-Billable</option>
                    <option value="false_positive">False Positive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={selectedDamageId ? handleUpdateDamage : handleCreateDamage}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingDamage(false);
                      setEditForm({});
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedDamage && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Part</label>
                  <p className="text-gray-900">{selectedDamage.partName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{selectedDamage.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{selectedDamage.damageType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getSeverityColor(selectedDamage.severity) }}
                    />
                    <span className="text-gray-900">{getSeverityLabel(selectedDamage.severity)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedDamage.status)}`}>
                    {getStatusLabel(selectedDamage.status)}
                  </span>
                </div>
                {selectedDamage.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900 text-sm">{selectedDamage.notes}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setEditForm(selectedDamage);
                    setIsEditingDamage(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Damage
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
