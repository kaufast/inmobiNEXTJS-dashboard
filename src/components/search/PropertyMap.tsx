import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PropertyService } from "@/lib/property-service";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface PropertyMapProps {
  properties: Property[];
  loading?: boolean;
  height?: string;
  className?: string;
}

export default function PropertyMap({
  properties,
  loading = false,
  height = "600px",
  className = "",
}: PropertyMapProps) {
  const { t } = useTranslation('properties');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [_, navigate] = useLocation();
  
  // Setup and initialize the map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      leafletMap.current = L.map(mapRef.current, {
        center: [25.276987, 55.296249], // Dubai coordinates as default
        zoom: 12,
        zoomControl: false,
      });
      
      // Add modern, minimal tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMap.current);
      
      // Add zoom controls in a custom position
      L.control.zoom({
        position: 'topright'
      }).addTo(leafletMap.current);
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  // Update markers when properties change
  useEffect(() => {
    if (!loading && leafletMap.current && properties.length > 0) {
      // Clear existing markers
      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      
      // Collect valid coordinates for bounds
      const validCoordinates: L.LatLngExpression[] = [];
      
      // Add markers for properties
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          // Add to valid coordinates for bounds
          validCoordinates.push([property.latitude, property.longitude]);
          
          // Format price for display
          const isRental = property.listingType === 'rent';
          const priceFormatted = PropertyService.formatPrice(property.price, isRental);
          
          // Create custom icon for marker with modern design and animation
          const markerHtml = `
            <div class="marker-container">
              <div class="marker-pin bg-black text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transform transition-transform hover:scale-110">
                ${priceFormatted}
                <div class="marker-pin-arrow"></div>
              </div>
              <div class="marker-pulse"></div>
            </div>
          `;
          
          const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-marker-icon',
            iconSize: [100, 50],
            iconAnchor: [50, 48]
          });
          
          // Create marker and add to map
          const marker = L.marker([property.latitude, property.longitude], { icon })
            .addTo(leafletMap.current!);
          
          // Add modern styled popup with property info
          marker.bindPopup(`
            <div class="p-4 max-w-[250px]">
              <h3 class="font-bold text-base mb-2 truncate">${property.title}</h3>
              <div class="flex items-center mb-2">
                <span class="bg-gray-100 rounded-full px-2 py-1 text-xs font-medium mr-2">
                  <i class="fas fa-bed mr-1"></i> ${property.bedrooms}
                </span>
                <span class="bg-gray-100 rounded-full px-2 py-1 text-xs font-medium">
                  <i class="fas fa-bath mr-1"></i> ${property.bathrooms}
                </span>
              </div>
              <p class="font-bold text-lg mb-3">${priceFormatted}</p>
              <a href="/property/${property.id}" class="inline-block bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full text-center">
                ${t('map.viewDetails')}
              </a>
            </div>
          `, {
            closeButton: false,
            className: 'custom-popup-modern'
          });
        }
      });
      
      // Set bounds to fit all markers if we have valid coordinates
      if (validCoordinates.length > 0) {
        const bounds = L.latLngBounds(validCoordinates);
        leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties, loading, t]);
  
  if (loading) {
    return (
      <div style={{ height }} className={`bg-neutral-200 animate-pulse rounded-xl ${className}`}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-neutral-400 mb-3"></i>
            <p className="text-neutral-600">{t('map.loading')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div style={{ height }} className={`bg-neutral-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <i className="fas fa-map-marker-alt text-4xl text-neutral-300 mb-3"></i>
          <p className="text-neutral-600">{t('map.noProperties')}</p>
          <p className="text-sm text-neutral-500 mt-2">{t('map.tryAdjustingFilters')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className={`relative rounded-2xl overflow-hidden shadow-lg p-0 m-4 border border-gray-100 ${className}`}>
      <div ref={mapRef} className="h-full w-full"></div>
      
      {/* Reset View Button */}
      <Button
        className="absolute bottom-4 right-4 bg-black text-white hover:bg-gray-800 shadow-md rounded-lg z-[1000] transition-transform hover:scale-105"
        onClick={() => {
          if (leafletMap.current && properties.length > 0) {
            const validCoordinates = properties
              .filter(p => p.latitude && p.longitude)
              .map(p => [p.latitude!, p.longitude!] as L.LatLngExpression);
            
            if (validCoordinates.length > 0) {
              const bounds = L.latLngBounds(validCoordinates);
              leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        }}
      >
        <i className="fas fa-compress-alt mr-2"></i> {t('map.resetView')}
      </Button>
    </div>
  );
}
