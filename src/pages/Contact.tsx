import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageCircle, Send, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { EnquiryFormData } from '../types';

export const Contact: React.FC = () => {
  const { content, submitInquiry } = useWebsiteContent();
  const { businessInfo } = content;

  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: '',
    phone: '',
    category: 'Living Room',
    subject: '',
    message: '',
    preferredContact: 'WhatsApp',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields (Name, Phone, Message).');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await submitInquiry(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Failed to submit enquiry. Please try again or contact via WhatsApp.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again or contact directly via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#5A3E2B] font-semibold block mb-4">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#1C1511] mb-6">
            FIND THE RIGHT PIECE FOR YOUR SPACE.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#3A271C] font-light leading-relaxed">
            Visit our showroom in Jos or reach out to our team via phone, WhatsApp, or our enquiry form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information & Map Directions */}
          <div className="space-y-8">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#D8CEC0]">
              <div className="flex flex-col mb-8">
                <span className="font-serif text-2xl font-light tracking-[0.2em] text-[#1C1511]">
                  TATARI
                </span>
                <span className="text-xs font-sans tracking-[0.3em] text-[#C9A45C] uppercase">
                  Furniture Store
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full aspect-square bg-[#F6F1E8] text-[#5A3E2B] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#1C1511] mb-1">
                      Showroom Address
                    </h3>
                    <p className="text-sm text-[#3A271C] font-light leading-relaxed mb-2">
                      {businessInfo.address}
                    </p>
                    <a
                      href={businessInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#C9A45C] hover:text-[#5A3E2B] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      Open Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full aspect-square bg-[#F6F1E8] text-[#5A3E2B] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#1C1511] mb-1">
                      Direct Telephone
                    </h3>
                    <p className="text-sm text-[#3A271C] font-light mb-2">
                      {businessInfo.phone}
                    </p>
                    <a
                      href={`tel:${businessInfo.phoneInternational}`}
                      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#C9A45C] hover:text-[#5A3E2B] transition-colors"
                    >
                      Call Now
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full aspect-square bg-[#25D366]/10 text-[#25D366] flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#1C1511] mb-1">
                      WhatsApp Instant Chat
                    </h3>
                    <p className="text-sm text-[#3A271C] font-light mb-2">
                      Connect directly with our customer service desk for fast inquiries, product photos, and pricing.
                    </p>
                    <a
                      href={businessInfo.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#25D366] hover:opacity-80 transition-opacity"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Callout */}
            <div className="bg-[#1C1511] text-[#F6F1E8] p-8 rounded-3xl shadow-xl">
              <h3 className="font-serif text-2xl font-normal mb-3 text-[#F6F1E8]">
                Showroom Visiting Hours
              </h3>
              <p className="text-xs text-[#D8CEC0] font-light leading-relaxed mb-4">
                Monday – Saturday: 8:30 AM – 6:00 PM<br />
                Sunday: By Prior Appointment
              </p>
              <div className="pt-4 border-t border-[#3A271C]">
                <p className="text-[11px] text-[#C9A45C] tracking-wide uppercase font-semibold">
                  Personal Interior Consultation Available
                </p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#D8CEC0]">
            <h2 className="font-serif text-3xl font-normal text-[#1C1511] mb-2">
              Send an Enquiry
            </h2>
            <p className="text-xs text-[#3A271C] font-light mb-8">
              Send us details about the furniture you are looking for, and our team will respond promptly.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F6F1E8] border border-[#C9A45C] p-8 rounded-2xl text-center my-12"
              >
                <div className="w-16 h-16 rounded-full aspect-square bg-[#C9A45C] text-[#1C1511] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#1C1511] mb-2">
                  Enquiry Received
                </h3>
                <p className="text-[#3A271C] text-sm font-light mb-6">
                  Thank you, {formData.fullName}. Your enquiry regarding {formData.category} has been safely received and stored. Our team will contact you via {formData.preferredContact} at {formData.phone}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      phone: '',
                      category: 'Living Room',
                      subject: '',
                      message: '',
                      preferredContact: 'WhatsApp',
                    });
                  }}
                  className="rounded-full bg-[#1C1511] text-[#F6F1E8] text-xs uppercase tracking-wider px-6 py-3 font-medium hover:bg-[#3A271C] transition-colors"
                >
                  Send Another Enquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0803 217 4376"
                    className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                      Furniture Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Custom Furniture">Custom Furniture</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Either">Either</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                    Subject / Piece of Interest
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. 7-Seater Sectional or Bespoke Dining Table"
                    className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A271C] font-medium mb-2">
                    Message / Specifications *
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your room dimensions, color preferences, or delivery timeline..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D8CEC0] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm bg-[#F6F1E8]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] font-medium text-xs tracking-wider uppercase py-4 transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Enquiry...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Enquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
