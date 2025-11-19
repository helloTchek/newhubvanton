import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Plus } from 'lucide-react';
import { Tag } from '../../types';
import { tagService } from '../../services/tagService';
import toast from 'react-hot-toast';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsApplied: (tagId: string) => void;
  vehicleCount: number;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  onTagsApplied,
  vehicleCount
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10B981');
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#6B7280', '#059669'
  ];

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      const tags = await tagService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      toast.error('Failed to load tags');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      setIsLoading(true);
      const tag = await tagService.createTag(newTagName.trim(), newTagColor);
      setSelectedTagId(tag.id);
      setNewTagName('');
      setNewTagColor('#10B981');
      setIsCreatingTag(false);
      toast.success('Tag created');
      await loadTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error('Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedTagId) {
      toast.error('Please select a tag');
      return;
    }
    onTagsApplied(selectedTagId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Apply Tag to Vehicles</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Add a tag to {vehicleCount} selected vehicle{vehicleCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isCreatingTag ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tag
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allTags.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No tags available</p>
                  ) : (
                    allTags.map(tag => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="tag"
                          value={tag.id}
                          checked={selectedTagId === tag.id}
                          onChange={(e) => setSelectedTagId(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsCreatingTag(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <Plus className="w-4 h-4" />
                Create New Tag
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Color
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        border: newTagColor === color ? '3px solid black' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTag}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Tag'}
                </button>
                <button
                  onClick={() => {
                    setIsCreatingTag(false);
                    setNewTagName('');
                    setNewTagColor('#10B981');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTagId || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Tag
          </button>
        </div>
      </div>
    </div>
  );
};
