import React, { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Search,
  Home as HomeIcon,
  Bed,
  Bath,
  User,
  Mic as MicIcon
} from "lucide-react";
import './glow-effect.css';

export default function Hero() {
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const glowRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Pulse effect
    if (glowRef.current) {
      glowRef.current.classList.remove('glow-pulse');
      // Force reflow to restart animation if needed
      void glowRef.current.offsetWidth;
      glowRef.current.classList.add('glow-pulse');
      setTimeout(() => {
        glowRef.current && glowRef.current.classList.remove('glow-pulse');
        let url = `/search?city=${encodeURIComponent(searchQuery)}`;
        if (activeTab !== "all") {
          url += `&propertyType=${activeTab}`;
        }
        navigate(url);
      }, 500);
    } else {
      let url = `/search?city=${encodeURIComponent(searchQuery)}`;
      if (activeTab !== "all") {
        url += `&propertyType=${activeTab}`;
      }
      navigate(url);
    }
  };

  return (
    <section className="relative overflow-visible pt-6 pb-16">
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Card-based layout as shown in reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative min-h-[400px] md:min-h-[500px]">
          {/* Left Card */}
          <div className="bg-[#131313] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden">


            {/* Location Information */}
            <div className="mt-20">
              <p className="text-sm text-gray-200">{t('hero.title')}</p>
              <p className="text-sm text-gray-200 mb-4">
                {t('hero.description')}
              </p>
            </div>

            {/* Builder Information */}
            <div className="mt-4">
              <p className="text-sm text-gray-200"></p>
              <p className="text-sm text-gray-200"></p>
              <p className="text-sm text-gray-200 mb-8"></p>
            </div>

            {/* Property Title */}
            <div className="mt-8 md:mt-12">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light">
                {t('hero.mainTitle')}
              </h1>
            </div>
          </div>

          {/* Right Card - Property Image with Details Card */}
          <div className="bg-gray-200 rounded-3xl relative overflow-hidden h-full min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop";
              }}
              alt={t('hero.familyHomeAlt')}
              className="w-full h-full object-cover"
            />

            {/* Location Tag */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-[#131313]/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-sm text-white">
                <p>{t('hero.title')}</p>
                <p>— {t('hero.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Positioned higher between the two cards */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[15%] md:top-[15%] z-30 w-full max-w-xl px-4">
          <div className="bg-[#2A2A2A]/80 backdrop-blur-md shadow-lg p-3 md:p-3 rounded-2xl relative overflow-visible">
            {/* Search input with glow */}
            <div className="glow-container relative overflow-visible" ref={glowRef}>
              <span className="glow-span" />
              <span className="glow-span" />
              <div className="bg-white rounded-full shadow-sm relative z-10">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="flex-grow relative pl-4">
                    <Input
                      type="text"
                      placeholder={t('hero.searchPlaceholder')}
                      className="w-full border-none shadow-none h-12 md:h-12 text-base px-4 py-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-1 px-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full h-10 w-10 md:h-9 md:w-9 p-0"
                      title={t('hero.location')}
                      onClick={() => navigate("/spatial-search")}
                    >
                      <MapPin className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full h-10 w-10 md:h-9 md:w-9 p-0"
                      title={t('hero.voiceSearch')}
                      onClick={() => navigate("/voice-search")}
                    >
                      <MicIcon className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full h-10 w-10 md:h-9 md:w-9 p-0 bg-black text-white hover:bg-white hover:text-black border border-black transition-all"
                    >
                      <Search className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Search option buttons */}
            <div className="flex flex-wrap gap-2 mt-3 mx-auto bg-[#1D1D1D]/80 backdrop-blur-sm rounded-full p-2 w-full max-w-md">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("advanced")}
                className={`rounded-full text-sm md:text-xs py-3 px-6 md:py-2 md:px-4 font-medium flex-1 min-w-[80px] ${activeTab === "advanced" ? "bg-[#131313] text-white shadow-lg" : "bg-[#2A2A2A] text-white hover:bg-[#131313] hover:text-white"} transition-all duration-200 border border-[#404040] hover:border-[#606060]`}
              >
                {t('hero.advanced')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/voice-search")}
                className={`rounded-full text-sm md:text-xs py-3 px-6 md:py-2 md:px-4 font-medium flex-1 min-w-[80px] bg-[#2A2A2A] text-white hover:bg-[#131313] hover:text-white transition-all duration-200 border border-[#404040] hover:border-[#606060]`}
              >
                {t('hero.voiceSearch')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/search-wizard")}
                className={`rounded-full text-sm md:text-xs py-3 px-6 md:py-2 md:px-4 font-medium flex-1 min-w-[80px] bg-[#2A2A2A] text-white hover:bg-[#131313] hover:text-white transition-all duration-200 border border-[#404040] hover:border-[#606060]`}
              >
                {t('hero.searchWizard')}
              </Button>
            </div>
          </div>
        </div>

        {/* Bedroom details card section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="lg:col-span-1">
            <div className="bg-black text-white rounded-3xl p-6">
              <div className="flex space-x-2 mb-4">
                <div className="bg-gray-800 text-white rounded-full px-3 py-1 flex items-center justify-center">
                  <span className="text-xs">{t('general.featured')}</span>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">{t('propertyTypes.bedroom')}</h3>
              <p className="text-sm text-gray-300 mb-4">
                {t('propertyDetails.bedroomDescription')}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-white" />
                  <span>{t('propertyDetails.guests', { count: 2 })}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1 text-white" />
                  <span>{t('propertyDetails.bathrooms', { count: 1 })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-gray-200 rounded-3xl overflow-hidden h-full min-h-[300px]">
              <img
                src="/images/apartment-interior.jpg"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                }}
                alt={t('propertyDetails.bedroomInteriorAlt')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Find Your Dream Property Section */}
        <div className="w-full mt-12 bg-white/5 backdrop-blur-sm p-8 rounded-3xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('searchSection.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('searchSection.subtitle')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
