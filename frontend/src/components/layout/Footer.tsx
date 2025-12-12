import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-900 text-white py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
                              <span className="text-xl font-bold">LifeOS</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your comprehensive personal life management system. Organize goals, track habits, 
              manage time, and visualize progress all in one beautiful interface.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for productivity enthusiasts</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Goal Management</li>
              <li>Time Tracking</li>
              <li>Habit Formation</li>
              <li>Visual Action Zone</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
                      <p>&copy; 2025 LifeOS. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;