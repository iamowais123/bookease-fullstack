import mongoose, { Document, Schema } from 'mongoose';

export interface IExpert extends Document {
  name: string;
  role: string;
  experience: string;
  specialty: string;
  rating: number;
  image: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expertSchema = new Schema<IExpert>(
  {
    name: {
      type: String,
      required: [true, 'Expert name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role/Title is required'],
      trim: true,
      maxlength: [100, 'Role must not exceed 100 characters'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
      maxlength: [50, 'Experience must not exceed 50 characters'],
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
      maxlength: [150, 'Specialty must not exceed 150 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      default: 5.0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    bio: {
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

expertSchema.index({ isActive: 1 });
expertSchema.index({ createdAt: -1 });

export const Expert = mongoose.model<IExpert>('Expert', expertSchema);
