'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Zap,
  Phone,
  MapPin,
  Mail,
  Award,
  UserCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, isDoctor, isAdmin, isPatient } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (isDoctor) {
        router.push('/doctor/dashboard');
      } else if (isPatient) {
        router.push('/appointments');
      }
    }
  }, [isAuthenticated, isAdmin, isDoctor, isPatient, router]);

  // Show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Book appointments with your preferred doctors in just a few clicks. No more waiting on hold or visiting the clinic in person.'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See doctor availability in real-time and book instantly. Get instant confirmations and reminders for your appointments.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health information is protected with industry-standard security protocols and HIPAA compliance measures.'
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals across all medical specialties. All doctors are verified and licensed.'
    }
  ];

  const services = [
    {
      title: 'Primary Care',
      description: 'Comprehensive health checkups, preventive care, and treatment for common illnesses.',
      icon: UserCheck
    },
    {
      title: 'Specialist Consultations',
      description: 'Access to specialists in cardiology, dermatology, orthopedics, and more.',
      icon: Stethoscope
    },
    {
      title: 'Health Monitoring',
      description: 'Track your health metrics and receive personalized health recommendations.',
      icon: Activity
    },
    {
      title: 'Emergency Care',
      description: '24/7 access to emergency medical consultations and urgent care services.',
      icon: Heart
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Patients' },
    { number: '150+', label: 'Expert Doctors' },
    { number: '24/7', label: 'Support Available' },
    { number: '99.2%', label: 'Satisfaction Rate' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'Eshaafi made booking my doctor appointments so easy. The platform is intuitive and the doctors are excellent.',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      content: 'As a doctor, I love how Eshaafi streamlines patient management. It saves time and improves patient care.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      content: 'The real-time availability feature is fantastic. I can book appointments that fit my schedule perfectly.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 medical-gradient opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full text-green-700 text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                <span>Your Health, Our Priority</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Professional
                <span className="text-green-600"> Healthcare</span>
                <br />
                at Your Fingertips
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with expert doctors, book appointments seamlessly, and manage your healthcare journey with our comprehensive platform designed for modern healthcare needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {!isAuthenticated ? (
                  <>
                    <Link href="/register" className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2">
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link href="/book-appointment" className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2">
                    <span>Book Appointment</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Licensed Doctors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl shadow-green-200" >
                <Image
                  src="https://img.freepik.com/premium-vector/doctors-with-stethoscope-group-medical-students-nurses-vector-illustration_650087-840.jpg?w=1000"
                  alt="Professional doctor consultation"
                  fill
                  className="object-center object-fill rounded-2xl shadow-xl"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green/20 to-transparent"></div>
              </div>
              
              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">150+</div>
                    <div className="text-sm text-gray-600">Expert Doctors</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Medical Icons Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted Medical Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We partner with leading medical institutions and healthcare providers to deliver exceptional care.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864567.jpg"
                alt="Medical Cross"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864568.jpg"
                alt="Medical Logo"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864569.jpg"
                alt="Healthcare Logo"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864569.jpg"
                alt="Medical Center"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864570.jpg"
                alt="Health Clinic"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://img.freepik.com/free-vector/medical-logo-template_23-2148864571.jpg"
                alt="Medical Institute"
                width={80}
                height={80}
                className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access a wide range of medical services from the comfort of your home. Our platform connects you with qualified healthcare professionals across all specialties.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-105"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Eshaafi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience healthcare like never before with our innovative platform designed for modern patients and doctors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-105"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Facility Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                State-of-the-Art Medical Facilities
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our partner facilities are equipped with the latest medical technology and staffed by experienced healthcare professionals. We maintain the highest standards of care and safety.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced Medical Equipment</h3>
                    <p className="text-gray-600">Latest diagnostic and treatment technologies</p>
                  </div>

                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Experienced Staff</h3>
                    <p className="text-gray-600">Qualified and certified healthcare professionals</p>
                  </div>

                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Clean & Safe Environment</h3>
                    <p className="text-gray-600">Maintained to the highest hygiene standards</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://img.freepik.com/free-vector/hospital-building-concept-illustration_114360-8440.jpg"
                  alt="Modern medical facility"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what patients and doctors have to say about their experience with Eshaafi.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Have questions about our services? Our support team is here to help you 24/7. Contact us through any of the channels below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@eshaafi.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Main Office</h3>
                    <p className="text-gray-600">123 Medical Center Dr, Suite 100</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://img.freepik.com/free-vector/doctor-patient-consultation-illustration_23-2148856560.jpg"
                  alt="Doctor consultation"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-[#F0F9FF] relative flex flex-col items-center justify-center p-0 m-0">
        {/* Decorative background element */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-20">
            <path fill="#1CA7A6" fillOpacity="0.08" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative w-full flex flex-col items-center justify-center px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center py-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0E6BA8] mb-6 leading-tight drop-shadow-sm">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-2xl text-[#1F2937] mb-10 font-medium">
              Join thousands of patients who trust <span className="text-[#1CA7A6] font-bold">Eshaafi</span> for their healthcare needs. Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/register" className="btn-primary text-lg px-10 py-4 flex items-center justify-center shadow-lg">
                    Get Started Today
                  </Link>
                  <Link href="/login" className="btn-secondary text-lg px-10 py-4 flex items-center justify-center shadow-lg">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link href="/book-appointment" className="btn-primary text-lg px-10 py-4 flex items-center justify-center shadow-lg">
                  Book Your First Appointment
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
