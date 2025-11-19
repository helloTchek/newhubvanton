import React, { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { Tag } from '../../types';
import { tagService } from '../../services/tagService';
import toast from 'react-hot-toast';

interface TagManagerProps {
  vehicleId: string;
  currentTags: Tag[];
  onTagsUpdated: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ vehicleId, currentTags, onTagsUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10B981');
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#6B7280', '#059669'
  ];

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreatingTag(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTags = async () => {
    try {
      const tags = await tagService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      toast.error('Failed to load tags');
    }
  };

  const handleAddTag = async (tag: Tag) => {
    try {
      await tagService.addTagToVehicle(vehicleId, tag.id);
      toast.success('Tag added');
      onTagsUpdated();
    } catch (error) {
      console.error('Failed to add tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = async (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    try {
      await tagService.removeTagFromVehicle(vehicleId, tagId);
      toast.success('Tag removed');
      onTagsUpdated();
    } catch (error) {
      console.error('Failed to remove tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      const tag = await tagService.createTag(newTagName.trim(), newTagColor);
      await tagService.addTagToVehicle(vehicleId, tag.id);
      toast.success('Tag created and added');
      setNewTagName('');
      setNewTagColor('#10B981');
      setIsCreatingTag(false);
      onTagsUpdated();
      loadTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error('Failed to create tag');
    }
  };

  const availableTags = allTags.filter(
    tag => !currentTags.some(ct => ct.id === tag.id)
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <TagIcon className="w-3 h-3" />
        <span>Tags</span>
        {currentTags.length > 0 && (
          <span className="ml-0.5 px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">
            {currentTags.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3">
            {currentTags.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-2">Current Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentTags.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button
                        onClick={(e) => handleRemoveTag(e, tag.id)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableTags.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-2">Available Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      className="px-2 py-1 rounded-full text-xs font-medium text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isCreatingTag ? (
              <button
                onClick={() => setIsCreatingTag(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Tag
              </button>
            ) : (
              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Create New Tag</div>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-1.5 mb-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        border: newTagColor === color ? '2px solid black' : 'none'
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTag}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Create & Add
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingTag(false);
                      setNewTagName('');
                      setNewTagColor('#10B981');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
