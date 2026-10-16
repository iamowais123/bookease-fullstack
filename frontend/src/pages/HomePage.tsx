import React, { useEffect, useState } from 'react';
import {
  Clock,
  Award,
  ShieldCheck,
  ArrowRight,
  Scissors,
  Sparkles,
  Star,
  MapPin,
  Phone,
  Mail,
  Send,
  Heart,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { fetchServices, setSelectedCategory } from '../store/servicesSlice.js';
import { openBookingModal } from '../store/bookingSlice.js';
import { queryApi } from '../api/query.api.js';
import { expertApi, type Expert } from '../api/expert.api.js';
import { galleryApi, type GalleryItem } from '../api/gallery.api.js';
import { testimonialApi, type TestimonialItem } from '../api/testimonial.api.js';
import { contactQueryFormSchema } from '../validators/schemas.js';
import { showErrorToast, showSuccessToast } from '../store/toastSlice.js';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { BookingModal } from '../components/booking/BookingModal.js';
import type { Service } from '../types/index.js';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: services, selectedCategory, isLoading } = useAppSelector(
    (state) => state.services
  );

  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSendingQuery, setIsSendingQuery] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Client Testimonial review modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewService, setReviewService] = useState('Hair Styling & Balayage');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      dispatch(showErrorToast('Your Name and Review Comment are required', 'Validation Error'));
      return;
    }
    if (/[0-9]/.test(reviewName)) {
      dispatch(showErrorToast('Numbers are not allowed in Name', 'Validation Error'));
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await testimonialApi.createTestimonial({
        name: reviewName.trim(),
        service: reviewService.trim(),
        rating: parseInt(reviewRating, 10) || 5,
        comment: reviewComment.trim(),
      });
      dispatch(showSuccessToast('Thank you! Your testimonial has been posted and saved to database!'));
      setTestimonialsList((prev) => [res.testimonial, ...prev]);
      setIsReviewModalOpen(false);
      setReviewName('');
      setReviewComment('');
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to submit review'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    dispatch(fetchServices());

    // Load Experts/Stylists from DB
    setIsLoadingExperts(true);
    expertApi
      .getExperts()
      .then((data) => setExperts(data))
      .catch((err) => console.error('Failed to load experts from DB:', err))
      .finally(() => setIsLoadingExperts(false));

    // Load Gallery from DB
    setIsLoadingGallery(true);
    galleryApi
      .getGallery()
      .then((data) => setGalleryItems(data))
      .catch((err) => console.error('Failed to load gallery from DB:', err))
      .finally(() => setIsLoadingGallery(false));

    // Load Testimonials from DB
    setIsLoadingTestimonials(true);
    testimonialApi
      .getTestimonials()
      .then((data) => setTestimonialsList(data))
      .catch((err) => console.error('Failed to load testimonials from DB:', err))
      .finally(() => setIsLoadingTestimonials(false));
  }, [dispatch]);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'Hair', label: 'Hair Cuts & Styling' },
    { id: 'Color', label: 'Hair Coloring' },
    { id: 'Facial', label: 'Skin & Facials' },
    { id: 'Spa', label: 'Spa & Wellness' },
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleBookService = (service: Service) => {
    dispatch(openBookingModal(service));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    const validation = contactQueryFormSchema.safeParse({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMsg,
    });

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please fix the errors in your message';
      setContactError(msg);
      dispatch(showErrorToast(msg, 'Validation Error'));
      return;
    }

    setIsSendingQuery(true);
    try {
      await queryApi.submitQuery({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMsg,
      });
      setContactSubmitted(true);
      dispatch(showSuccessToast('Your inquiry has been received and saved to database!'));
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
      setTimeout(() => {
        setContactSubmitted(false);
      }, 5000);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit your message. Please try again.';
      setContactError(msg);
      dispatch(showErrorToast(msg, 'Inquiry Error'));
    } finally {
      setIsSendingQuery(false);
    }
  };





  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <BookingModal />

      {/* HERO SECTION - REPLICATING REFERENCE SCREENSHOT 2 */}
      <section
        id="home"
        className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden"
      >
        {/* Background salon photo overlay matching Screenshot 2 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          {/* Soft high-key overlay matching the bright modern salon aesthetic */}
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 via-white/70 to-white" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voted #1 Premium Salon 2024</span>
          </div>

          {/* Heading matching Screenshot 2: "Transform Your Look at Perfect Darshan" */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Transform Your Look at{' '}
            <span className="text-[#3B1E78] font-serif block sm:inline">
              Perfect Darshan
            </span>
          </h1>

          {/* Subheading matching Screenshot 2 */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            Experience luxury hair and beauty services with our expert stylists
          </p>

          {/* CTA Button matching Screenshot 2: "Book Appointment ->" */}
          <div className="mt-8 flex justify-center">
            <button
              id="hero-book-btn"
              onClick={() => dispatch(openBookingModal())}
              className="px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-base font-semibold shadow-lg shadow-purple-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE BADGES BAR - REPLICATING SCREENSHOT 2 EXACTLY */}
      <section className="border-y border-gray-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Badge 1: Open Daily */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-gray-900">Open Daily</h4>
                <p className="text-xs text-gray-500">10:00 AM - 8:00 PM</p>
              </div>
            </div>

            {/* Badge 2: Award Winning */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-gray-900">Award Winning</h4>
                <p className="text-xs text-gray-500">Best Salon 2024</p>
              </div>
            </div>

            {/* Badge 3: 100% Hygienic */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-gray-900">100% Hygienic</h4>
                <p className="text-xs text-gray-500">Premium Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR SERVICES SECTION - REPLICATING SCREENSHOT 2 */}
      <section id="services" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
              Our Services
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Professional hair care and beauty treatments
            </p>

            {/* Category tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => dispatch(setSelectedCategory(cat.id))}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services Cards Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">Loading catalog...</div>
          ) : filteredServices.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-8 max-w-lg mx-auto space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Services in Catalog</h3>
              <p className="text-xs text-gray-500">
                Database me filhal koi active service nahi hai. Nayi services add karne ke liye Admin Dashboard use karein ya seed script run karein.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service._id || service.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                        {service.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{service.duration} mins</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {service.name}
                    </h3>

                    <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400">Starting from</span>
                      <p className="text-xl font-extrabold text-gray-900">
                        ${service.price}{' '}
                        <span className="text-xs font-normal text-gray-500">
                          {service.currency || 'CAD'}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleBookService(service)}
                      className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-[#7C3AED] hover:text-white transition-all shadow-xs"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STYLISTS SECTION */}
      <section id="stylists" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Artisans of Beauty
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-serif">
              Meet Our Expert Stylists
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Passionate professionals dedicated to bringing your personal aesthetic vision to life
            </p>
          </div>

          {isLoadingExperts && experts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Loading salon expert team...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {experts.map((st) => (
                <div
                  key={st._id || st.name}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={st.image}
                      alt={st.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{st.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      {st.experience}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{st.name}</h3>
                    <p className="text-xs font-medium text-gray-500">{st.role}</p>
                    <p className="mt-3 text-xs text-gray-600 italic">
                      Specialty: {st.specialty}
                    </p>

                    <button
                      onClick={() => dispatch(openBookingModal())}
                      className="w-full mt-5 py-2.5 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Schedule Appointment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY SHOWCASE */}
      <section id="gallery" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Visual Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-serif">
              Our Styling Gallery
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              A glimpse into the transformations created every day at Perfect Darshan
            </p>
          </div>

          {isLoadingGallery && galleryItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading gallery showcase...</div>
          ) : galleryItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">No gallery images available yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((g) => (
                <div
                  key={g._id}
                  className="relative rounded-2xl overflow-hidden shadow-sm group h-80"
                >
                  <img
                    src={g.image}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] uppercase font-bold text-purple-300">
                      {g.category}
                    </span>
                    <h4 className="text-sm font-bold">{g.title}</h4>
                    {g.description && <p className="text-[11px] text-gray-300 mt-1 line-clamp-2">{g.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Client Praise
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-serif">
              What Our Clients Say
            </h2>
            <p className="mt-3 text-sm text-gray-600">Real feedback from clients transformed at our salon</p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Share Your Experience / Write a Review</span>
            </button>
          </div>

          {isLoadingTestimonials && testimonialsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading client praise...</div>
          ) : testimonialsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">No client testimonials posted yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonialsList.map((t) => (
                <div
                  key={t._id}
                  className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex gap-1 text-amber-400 mb-3">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-100/60 flex items-center gap-3">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover border border-purple-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-800 font-bold text-xs flex items-center justify-center">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{t.name}</h4>
                      <p className="text-[10px] text-purple-600 font-medium">{t.service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT & LOCATION SECTION */}
      <section id="contact" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 font-serif">
                Visit Our Luxury Salon
              </h2>
              <p className="mt-3 text-sm text-slate-300 max-w-md">
                Have questions about our treatments or wedding packages? Drop us a note or walk in during our working hours.
              </p>

              <div className="mt-8 space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>104 Boulevard Luxury Avenue, Suite 302, Central District</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>+1 (555) 382-7264</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>hello@bookease-salon.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>Monday - Sunday: 10:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>

              {/* Inquiries Form */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1">Send a Message</h3>
                <p className="text-[11px] text-slate-400 mb-4">Have queries? Fill the form and it will be saved directly to our database.</p>

                {contactSubmitted ? (
                  <div className="p-4 bg-emerald-900/50 text-emerald-200 border border-emerald-700 rounded-xl text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-bold">✨ Inquiry Received & Saved!</p>
                      <p className="text-[11px] text-emerald-300 mt-0.5">Thank you! Your query has been recorded. Our salon team will get back to you shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                    {contactError && (
                      <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{contactError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onKeyDown={(e) => {
                          if (/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                            dispatch(showErrorToast('Numbers are not allowed in Name', 'Invalid Input'));
                          }
                        }}
                        onChange={(e) => setContactName(e.target.value.replace(/[0-9]/g, ''))}
                        placeholder="Jane Doe (Letters only)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          onBlur={() => {
                            if (contactEmail && /^\d+$/.test(contactEmail.trim())) {
                              dispatch(showErrorToast('Email address cannot be just numbers. Please enter a valid email.', 'Invalid Email'));
                            }
                          }}
                          placeholder="jane@example.com"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">
                          Phone Number (10 digits) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={contactPhone}
                          onKeyDown={(e) => {
                            if (
                              ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
                              (e.ctrlKey || e.metaKey)
                            ) {
                              return;
                            }
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                              dispatch(showErrorToast('Letters and symbols are not allowed. Only numbers are accepted for phone number.', 'Invalid Phone'));
                            }
                          }}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setContactPhone(digits);
                          }}
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Message *</label>
                      <textarea
                        rows={3}
                        required
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="Ask about packages, appointments, or special bridal styling..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingQuery}
                      className="w-full py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingQuery ? 'Saving Query...' : 'Send Inquiry'}</span>
                    </button>
                  </form>
                )}
              </div>
          </div>
        </div>
      </section>

      {/* Client Review / Testimonial Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Share Your Experience
                </h3>
                <p className="text-xs text-gray-500">Post your feedback directly to our client reviews</p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-3.5 text-xs text-gray-700">
              <div>
                <label className="block font-semibold mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onKeyDown={(e) => {
                    if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                      dispatch(showErrorToast('Numbers are not allowed in Name', 'Invalid Input'));
                    }
                  }}
                  onChange={(e) => setReviewName(e.target.value.replace(/[0-9]/g, ''))}
                  placeholder="e.g. Priya Sen (Letters only)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Service Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    placeholder="e.g. French Balayage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Rating (Stars) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your styling experience and how our staff treated you..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  {isSubmittingReview ? 'Posting Review...' : 'Post Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
