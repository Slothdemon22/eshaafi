'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Save, 
  Trash2, 
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';

interface TimeSlot {
  id?: number;
  startTime: string;
  endTime: string;
  duration: number;
  isSelected: boolean;
  location?: string;
  custom?: boolean;
}

const DoctorAvailabilityPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { addToast } = useToast();

  const [customSlot, setCustomSlot] = useState({
    startTime: '',
    endTime: '',
    location: '',
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [slotTypeFilter, setSlotTypeFilter] = useState<'all' | 'custom' | 'half' | 'full'>('all');

  // Generate time slots for 30-minute and 1-hour intervals
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      // 30-minute slot
      const startTime30 = `${hour.toString().padStart(2, '0')}:00`;
      const endTime30 = `${hour.toString().padStart(2, '0')}:30`;
      slots.push({
        startTime: startTime30,
        endTime: endTime30,
        duration: 30,
        isSelected: false,
        location: ''
      });

      // 1-hour slot (if not the last hour)
      if (hour < endHour - 1) {
        const startTime60 = `${hour.toString().padStart(2, '0')}:00`;
        const endTime60 = `${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push({
          startTime: startTime60,
          endTime: endTime60,
          duration: 60,
          isSelected: false,
          location: ''
        });
      }

      // 30-minute slot (second half)
      const startTime30b = `${hour.toString().padStart(2, '0')}:30`;
      const endTime30b = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        startTime: startTime30b,
        endTime: endTime30b,
        duration: 30,
        isSelected: false,
        location: ''
      });
    }

    setTimeSlots(slots);
  };

  // Load existing availability for selected date
  const loadAvailability = async () => {
    if (!selectedDate) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/doctor/availability?date=${selectedDate}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const existingSlots = data.slots || [];
        
        // Mark existing slots as selected
        const updatedSlots = timeSlots.map(slot => ({
          ...slot,
          isSelected: existingSlots.some((existing: any) => 
            existing.startTime === slot.startTime && 
            existing.endTime === slot.endTime
          )
        }));
        
        setTimeSlots(updatedSlots);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load existing availability'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save availability
  const saveAvailability = async () => {
    if (!selectedDate) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a date first'
      });
      return;
    }

    const selectedSlots = timeSlots.filter(slot => slot.isSelected);
    
    if (selectedSlots.length === 0) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Please select at least one time slot'
      });
      return;
    }

    try {
      setIsSaving(true);
      const slotsData = selectedSlots.map(slot => ({
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        location: slot.location || ''
      }));

      const response = await fetch('http://localhost:5000/api/doctor/availability/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ slots: slotsData }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Availability saved successfully'
        });
      } else {
        throw new Error('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save availability'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotClick = (index: number) => {
    setTimeSlots(prev => 
      prev.map((slot, i) => 
        i === index ? { ...slot, isSelected: !slot.isSelected } : slot
      )
    );
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    generateTimeSlots(); // Generate fresh slots for new date
  };

  // Add custom slot handler
  const handleAddCustomSlot = async () => {
    if (!selectedDate || !customSlot.startTime || !customSlot.endTime) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill all custom slot fields',
      });
      return;
    }
    // Calculate duration in minutes
    const [sh, sm] = customSlot.startTime.split(':').map(Number);
    const [eh, em] = customSlot.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    if (duration <= 0) {
      addToast({ type: 'error', title: 'Error', message: 'End time must be after start time' });
      return;
    }
    try {
      setIsAddingCustom(true);
      const response = await fetch('http://localhost:5000/api/doctor/addAvailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          startTime: customSlot.startTime,
          endTime: customSlot.endTime,
          duration,
          location: customSlot.location,
          custom: true
        })
      });
      if (response.ok) {
        addToast({ type: 'success', title: 'Success', message: 'Custom slot added' });
        setCustomSlot({ startTime: '', endTime: '', location: '' });
        loadAvailability();
      } else {
        throw new Error('Failed to add custom slot');
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add custom slot' });
    } finally {
      setIsAddingCustom(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  if (!isAuthenticated || !isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center medical-gradient">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in as a doctor to access this page.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen medical-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/doctor/dashboard" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Manage Availability
              </h1>
              <p className="text-xl text-gray-600">
                Set your availability for specific dates
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          {/* Date Selection */}
          <div className="mb-8">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field w-full md:w-64"
            />
          </div>

          {/* Custom Slot Form */}
          {selectedDate && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Custom Slot</h3>
              <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                <input
                  type="time"
                  value={customSlot.startTime}
                  onChange={e => setCustomSlot(s => ({ ...s, startTime: e.target.value }))}
                  className="input-field w-full md:w-32"
                  placeholder="Start Time"
                />
                <span>to</span>
                <input
                  type="time"
                  value={customSlot.endTime}
                  onChange={e => setCustomSlot(s => ({ ...s, endTime: e.target.value }))}
                  className="input-field w-full md:w-32"
                  placeholder="End Time"
                />
                <input
                  type="text"
                  value={customSlot.location}
                  onChange={e => setCustomSlot(s => ({ ...s, location: e.target.value }))}
                  className="input-field w-full md:w-48"
                  placeholder="Location (optional)"
                />
                <button
                  onClick={handleAddCustomSlot}
                  disabled={isAddingCustom}
                  className="btn-primary px-4 py-2 w-full md:w-auto"
                >
                  {isAddingCustom ? 'Adding...' : 'Add Custom Slot'}
                </button>
              </div>
            </div>
          )}

          {/* Slot Type Filter */}
          {selectedDate && (
            <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
              <label className="font-medium text-gray-700">Show:</label>
              <select
                value={slotTypeFilter}
                onChange={e => setSlotTypeFilter(e.target.value as any)}
                className="input-field w-full md:w-auto"
              >
                <option value="all">All Slots</option>
                <option value="custom">Custom</option>
                <option value="half">Half Hour</option>
                <option value="full">Full Hour</option>
              </select>
            </div>
          )}

          {selectedDate && (
            <>
              {/* Time Slots */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Time Slots for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner mr-3"></div>
                    <span className="text-gray-600">Loading existing availability...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {timeSlots
                      .filter(slot =>
                        slotTypeFilter === 'all' ? true :
                        slotTypeFilter === 'custom' ? slot.custom :
                        slotTypeFilter === 'half' ? slot.duration === 30 && !slot.custom :
                        slotTypeFilter === 'full' ? slot.duration === 60 && !slot.custom : true
                      )
                      .map((slot, index) => (
                        <div key={`${slot.startTime}-${slot.endTime}`} className="flex flex-col gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSlotClick(index)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              slot.isSelected
                                ? 'bg-green-500 border-green-500 text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-semibold text-sm">{new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                              <div className="text-xs opacity-75">to</div>
                              <div className="font-semibold text-sm">{new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                              <div className="text-xs mt-1">({slot.duration} min){slot.custom ? ' • Custom' : ''}</div>
                            </div>
                          </motion.button>
                          {slot.isSelected && (
                            <input
                              type="text"
                              placeholder="Location (e.g. Clinic Room 1)"
                              value={slot.location || ''}
                              onChange={e => {
                                const value = e.target.value;
                                setTimeSlots(prev => prev.map((s, i) => i === index ? { ...s, location: value } : s));
                              }}
                              className="input-field w-full text-xs mt-1"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveAvailability}
                disabled={isSaving}
                className="w-full md:w-auto btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="spinner"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Availability</span>
                  </>
                )}
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
