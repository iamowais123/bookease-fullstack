import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { uploadApi } from '../../api/upload.api.js';
import { useAppDispatch } from '../../store/index.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';

interface ImageUploadBoxProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  folder?: string;
  placeholder?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  value,
  onChange,
  required = false,
  folder = 'bookease_salon',
  placeholder = 'https://res.cloudinary.com/... or upload photo below',
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      dispatch(showErrorToast('Please select a valid image file (JPEG, PNG, WEBP)', 'Invalid File'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(showErrorToast('Image size should be under 5MB', 'File Too Large'));
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file, folder);
      onChange(res.url);
      dispatch(showSuccessToast('Image uploaded to Cloudinary successfully!', 'Cloudinary'));
    } catch (err: any) {
      dispatch(
        showErrorToast(
          err.message ||
            'Failed to upload to Cloudinary. Please verify your Cloudinary credentials in backend/.env',
          'Cloudinary Error'
        )
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      <label className="block font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          />
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          title="Upload image directly to Cloudinary"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Image</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Image Preview Thumbnail */}
      {value && (
        <div className="mt-1 flex items-center justify-between gap-2.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={value}
              alt="Preview"
              className="w-9 h-9 object-cover rounded-md border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p className="text-[10px] text-gray-600 truncate max-w-xs">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-red-500 hover:text-red-700 font-medium px-2 py-0.5 rounded hover:bg-red-50 shrink-0"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
