import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaMapMarkerAlt, FaPhone, FaCheckCircle } from 'react-icons/fa';

const FollowUp = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const doctors = [
    {
      name: 'Dr. Sarah Ahmed',
      specialty: 'Dermatologist',
      experience: '15 years',
      rating: 4.9,
      image: '👩‍⚕️'
    },
    {
      name: 'Dr. Mohamed Hassan',
      specialty: 'Skin Specialist',
      experience: '12 years',
      rating: 4.8,
      image: '👨‍⚕️'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-white text-5xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Appointment Confirmed! 🎉</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your follow-up appointment has been successfully scheduled.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-blue-900 mb-4">Appointment Details:</h3>
              <div className="space-y-3">
                <p className="flex items-center text-gray-700">
                  <FaCalendarAlt className="mr-3 text-blue-600" />
                  <strong className="mr-2">Date:</strong> {selectedDate}
                </p>
                <p className="flex items-center text-gray-700">
                  <FaClock className="mr-3 text-blue-600" />
                  <strong className="mr-2">Time:</strong> {selectedTime}
                </p>
                <p className="flex items-center text-gray-700">
                  <FaUserMd className="mr-3 text-blue-600" />
                  <strong className="mr-2">Type:</strong> {appointmentType === 'in-person' ? 'In-Person Visit' : 'Video Call'}
                </p>
              </div>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Schedule Follow-up Appointment</h1>
          <p className="text-xl text-gray-600">Choose your preferred time and doctor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit}>
                {/* Appointment Type */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Appointment Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAppointmentType('in-person')}
                      className={`p-4 border-2 rounded-xl font-semibold transition-all ${
                        appointmentType === 'in-person'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <FaUserMd className="text-2xl mx-auto mb-2" />
                      In-Person Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentType('video')}
                      className={`p-4 border-2 rounded-xl font-semibold transition-all ${
                        appointmentType === 'video'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <FaPhone className="text-2xl mx-auto mb-2" />
                      Video Call
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    <FaCalendarAlt className="inline mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    <FaClock className="inline mr-2" />
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 border-2 rounded-xl font-semibold transition-all ${
                          selectedTime === time
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Any specific concerns or questions for the doctor..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Confirm Appointment
                </button>
              </form>
            </div>
          </div>

          {/* Available Doctors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Doctors</h3>
              <div className="space-y-4">
                {doctors.map((doctor, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-4xl">{doctor.image}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">⭐ {doctor.rating}/5</span>
                      <span className="text-blue-600 font-semibold">{doctor.experience}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-blue-800">
                    <FaPhone className="mr-2" />
                    +20 123 456 7890
                  </p>
                  <p className="flex items-center text-blue-800">
                    <FaMapMarkerAlt className="mr-2" />
                    Cairo Medical Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;