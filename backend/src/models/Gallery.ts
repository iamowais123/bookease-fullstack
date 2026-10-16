import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  category: string;
  image: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Hair',
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ isActive: 1 });
gallerySchema.index({ createdAt: -1 });

export const Gallery = mongoose.model<IGallery>('Gallery', gallerySchema);
