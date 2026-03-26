import { useState } from "react";
import { FaStar, FaCloudUploadAlt, FaTimes, FaUser } from "react-icons/fa";
import Modal from "./Modal";

const AddTestimonialModal = ({ isOpen, onClose }) => {
  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    company: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    console.log("Submitted:", {
      ...formData,
      rating,
      image: selectedImage
    });

    // Reset and close
    setRating(0);
    setFormData({ name: "", jobTitle: "", company: "", message: "" });
    setSelectedImage(null);
    setPreviewUrl(null);
    onClose();
  };

  // Theme-consistent styles
  const inputStyles = "w-full px-4 py-3 bg-white border border-deep-charcoal/10 focus:border-tertiary outline-none transition-all text-sm font-medium text-deep-charcoal placeholder-deep-charcoal/20";
  const labelStyles = "block text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-2";

  return (
    <Modal isOpen={isOpen} onClose={onClose} dark={false}>
      {/* Header */}
      <div className="border-b border-deep-charcoal/5 pb-5 mb-8">
        <h4 className="text-2xl font-black text-deep-charcoal uppercase tracking-tight">
          Share Your Experience
        </h4>
        <p className="text-deep-charcoal/50 text-xs font-bold uppercase tracking-widest mt-2">
          Help us showcase the value of Trac Events.
        </p>
      </div>

      {/* Body - Form Content */}
      <div className="space-y-8">

        {/* Star Rating Section */}
        <div className="flex flex-col items-center justify-center py-2 bg-soft-beige/30 p-6 border border-deep-charcoal/5">
          <label className="text-[10px] font-bold text-deep-charcoal/40 uppercase tracking-[0.3em] mb-4">
            Overall Rating
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <FaStar
                  size={32}
                  className={`transition-colors duration-200 ${star <= (hoverRating || rating)
                    ? "text-tertiary"
                    : "text-deep-charcoal/10"
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className={labelStyles}>Profile Photo</label>
          <div className="flex items-center gap-6 mt-2">
            {/* Preview Circle */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-none border border-deep-charcoal/10 bg-white flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover grayscale" />
                ) : (
                  <FaUser className="text-deep-charcoal/10 text-3xl" />
                )}
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-deep-charcoal text-white rounded-none flex items-center justify-center hover:bg-tertiary transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            {/* Upload Input */}
            <div className="flex-grow">
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center gap-3 w-full px-4 py-4 border border-dashed border-deep-charcoal/20 cursor-pointer hover:border-tertiary hover:bg-tertiary/5 transition-all text-deep-charcoal/40 hover:text-tertiary group"
              >
                <FaCloudUploadAlt className="text-xl group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {selectedImage ? "Change Photo" : "Upload Image"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelStyles}>Full Name</label>
            <input
              name="name"
              id="name"
              type="text"
              required
              placeholder="John Doe"
              className={inputStyles}
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="jobTitle" className={labelStyles}>Job Title</label>
            <input
              name="jobTitle"
              id="jobTitle"
              type="text"
              required
              placeholder="Director of Sales"
              className={inputStyles}
              value={formData.jobTitle}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className={labelStyles}>Company Name</label>
          <input
            name="company"
            id="company"
            type="text"
            required
            placeholder="Global Hospitality Ltd"
            className={inputStyles}
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="message" className={labelStyles}>Your Review</label>
          <textarea
            name="message"
            id="message"
            rows={4}
            required
            placeholder="How was your experience with our team and platform?"
            className={`${inputStyles} resize-none`}
            value={formData.message}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>

      {/* Footer / Buttons */}
      <div className="mt-12 pt-8 border-t border-deep-charcoal/5 flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onClose}
          className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-deep-charcoal/40 hover:text-deep-charcoal transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          type="submit"
          className="bg-tertiary text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
        >
          Submit Review
        </button>
      </div>
    </Modal>
  );
};

export default AddTestimonialModal;