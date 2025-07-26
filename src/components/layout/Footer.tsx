import React from 'react';
import { Link } from 'wouter';
import { Twitter, Facebook, Instagram, Linkedin, Github, Mail, Map, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation(['dashboard', 'common']);
  
  return (
    <footer className="bg-[#131313] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">inMobi</h3>
            <p className="text-gray-300 mb-4">
              {t('common:footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common:footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:footer.links.home')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:footer.links.properties')}
                </Link>
              </li>
              <li>
                <Link href="/spatial-search" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:footer.links.mapSearch')}
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:footer.links.premium')}
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:footer.links.signUp')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.premiumFeatures')}</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">
                {t('footer.features.bulkUpload')}
              </li>
              <li className="text-gray-300">
                {t('footer.features.analytics')}
              </li>
              <li className="text-gray-300">
                {t('footer.features.featured')}
              </li>
              <li className="text-gray-300">
                {t('footer.features.aiRecommendations')}
              </li>
              <li className="text-gray-300">
                {t('footer.features.support')}
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common:footer.contactUs')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Map size={16} className="text-gray-300 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  {t('common:footer.address')}
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="text-gray-300 mr-2 flex-shrink-0" />
                <span className="text-gray-300">{t('common:footer.phone')}</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="text-gray-300 mr-2 flex-shrink-0" />
                <span className="text-gray-300">{t('common:footer.email')}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {t('common:footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('common:footer.termsOfService')}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('common:footer.privacyPolicy')}
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              {t('common:footer.cookiePolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}