// Workaround for TypeScript issues with React imports
// @ts-ignore - Forcing import to work despite TypeScript errors
import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, MapPin, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { geocodeAddress, composeAddress, areCoordinatesValid } from "@/lib/geocoding-service";
import { PropertyLocationMap } from "@/components/property/PropertyLocationMap";
import { AddressAutocomplete } from "@/components/property/AddressAutocomplete";

// Define TypeScript interfaces that might be missing from React
// Workaround for linter errors
// @ts-ignore
type ChangeEvent<T> = { target: T & EventTarget };

const countryConfigurations = {
  US: { 
    name: "USA", 
    phoneCode: "+1", 
    addressLabelKey: 'wizard.steps.location.addressLabel.US', 
    cityLabelKey: 'wizard.steps.location.cityLabel.US', 
    stateLabelKey: 'wizard.steps.location.stateLabel.US', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.US',
    states: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
    majorCities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
  },
  GB: { 
    name: "United Kingdom", 
    phoneCode: "+44", 
    addressLabelKey: 'wizard.steps.location.addressLabel.GB', 
    cityLabelKey: 'wizard.steps.location.cityLabel.GB', 
    stateLabelKey: 'wizard.steps.location.stateLabel.GB', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.GB',
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    majorCities: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Liverpool", "Bristol", "Leeds", "Sheffield", "Cardiff", "Belfast"]
  },
  MX: { 
    name: "Mexico", 
    phoneCode: "+52", 
    addressLabelKey: 'wizard.steps.location.addressLabel.MX', 
    cityLabelKey: 'wizard.steps.location.cityLabel.MX', 
    stateLabelKey: 'wizard.steps.location.stateLabel.MX', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.MX',
    states: ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
    majorCities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Cancún", "Mérida", "Acapulco"]
  },
  ES: { 
    name: "Spain", 
    phoneCode: "+34", 
    addressLabelKey: 'wizard.steps.location.addressLabel.ES', 
    cityLabelKey: 'wizard.steps.location.cityLabel.ES', 
    stateLabelKey: 'wizard.steps.location.stateLabel.ES', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.ES',
    states: ["Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco", "Valencia"],
    majorCities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"]
  },
  DE: { 
    name: "Germany", 
    phoneCode: "+49", 
    addressLabelKey: 'wizard.steps.location.addressLabel.DE', 
    cityLabelKey: 'wizard.steps.location.cityLabel.DE', 
    stateLabelKey: 'wizard.steps.location.stateLabel.DE', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.DE',
    states: ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
    majorCities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"]
  },
  AT: { 
    name: "Austria", 
    phoneCode: "+43", 
    addressLabelKey: 'wizard.steps.location.addressLabel.AT', 
    cityLabelKey: 'wizard.steps.location.cityLabel.AT', 
    stateLabelKey: 'wizard.steps.location.stateLabel.AT', 
    zipLabelKey: 'wizard.steps.location.zipCodeLabel.AT',
    states: ["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"],
    majorCities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Sankt Pölten", "Dornbirn"]
  },
};

// Default labels (matches your confirmed ones for US)
const defaultLabels = {
  address: { key: 'wizard.steps.location.addressLabel', default: 'Street Address' },
  city: { key: 'wizard.steps.location.cityLabel', default: 'City' },
  state: { key: 'wizard.steps.location.stateLabel', default: 'State' },
  zipCode: { key: 'wizard.steps.location.zipCodeLabel', default: 'ZIP Code' },
  approximateLocation: { key: 'wizard.steps.location.approximateLocationLabel', default: 'Approximate Location (Borough/District)' }
};

export function StepBasicInfoAndLocation() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { t } = useTranslation('properties');
  const [showExactAddress, setShowExactAddress] = useState<boolean>(Boolean(propertyData.address));
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | undefined>(
    Object.keys(countryConfigurations).find(code => countryConfigurations[code as keyof typeof countryConfigurations].name === propertyData.country)
  );
  
  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [geocodingError, setGeocodingError] = useState<string>('');

  useEffect(() => {
    // Update selectedCountryCode if propertyData.country changes externally
    const matchingCode = Object.keys(countryConfigurations).find(code => countryConfigurations[code as keyof typeof countryConfigurations].name === propertyData.country);
    setSelectedCountryCode(matchingCode);
  }, [propertyData.country]);

  // Auto-geocode when address components change
  useEffect(() => {
    const performGeocoding = async () => {
      // Only geocode if we have exact address enabled and sufficient address data
      if (!showExactAddress) return;
      
      const fullAddress = composeAddress({
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zipCode: propertyData.zipCode,
        country: propertyData.country
      });
      
      // Need at least address and city to geocode
      if (!propertyData.address || !propertyData.city) return;
      
      // Skip if we already have valid coordinates
      if (areCoordinatesValid(propertyData.latitude, propertyData.longitude)) {
        setGeocodingStatus('success');
        return;
      }
      
      console.log('Auto-geocoding address:', fullAddress);
      setIsGeocoding(true);
      setGeocodingStatus('idle');
      setGeocodingError('');
      
      try {
        const result = await geocodeAddress(fullAddress);
        
        if ('error' in result) {
          setGeocodingStatus('error');
          setGeocodingError(result.error);
          console.error('Geocoding failed:', result.error);
        } else {
          setGeocodingStatus('success');
          updatePropertyData({
            latitude: result.latitude,
            longitude: result.longitude
          });
          console.log('Geocoding successful:', result);
        }
      } catch (error) {
        setGeocodingStatus('error');
        setGeocodingError('Failed to geocode address');
        console.error('Geocoding error:', error);
      } finally {
        setIsGeocoding(false);
      }
    };
    
    // Debounce the geocoding to avoid too many API calls
    const timeoutId = setTimeout(performGeocoding, 1500);
    return () => clearTimeout(timeoutId);
  }, [
    showExactAddress,
    propertyData.address,
    propertyData.city,
    propertyData.state,
    propertyData.zipCode,
    propertyData.country,
    propertyData.latitude,
    propertyData.longitude,
    updatePropertyData
  ]);

  const handleCountryChange = (value: string) => {
    const countryCode = value; // value from Select is the country code (e.g., "US")
    const countryConfig = countryConfigurations[countryCode as keyof typeof countryConfigurations];
    if (countryConfig) {
      setSelectedCountryCode(countryCode);
      updatePropertyData({
        country: countryConfig.name, // Store full name
        phoneCountryCode: countryConfig.phoneCode,
      });
    } else {
      setSelectedCountryCode(undefined);
      updatePropertyData({
        country: '' // Or handle as "Other" if you add that option
        // phoneCountryCode: '' // Keep or clear previous code
      });
    }
  };
  
  // Handle toggling exact address
  const handleExactAddressToggle = (checked: boolean) => {
    setShowExactAddress(checked);
    
    // If toggling off, clear address fields
    if (!checked) {
      updatePropertyData({
        address: '',
        // Don't clear city and country as they may be needed for other steps
      });
    }
  };

  return (
    <div className="property-basic-info">
      <h2 className="text-xl font-bold px-8 py-4 border-b border-black">
        {t('wizard.steps.basicInfoAndLocation.title')}
      </h2>
      
      <div className="p-8 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Pencil className="h-5 w-5 text-black" />
            {t('wizard.steps.basicInfo.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">{t('wizard.steps.basicInfo.titleLabel')}</Label>
              <Input
                id="title"
                placeholder={t('wizard.steps.basicInfo.titlePlaceholder')}
                value={propertyData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ title: e.target.value })}
                className="h-12 text-lg border-black focus:border-black focus:ring-black"
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                {t('wizard.steps.basicInfo.titleHelp')}
              </p>
            </div>

            <div className="bg-black text-white p-4 rounded-lg mt-6">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t('wizard.steps.basicInfo.proTip')}
              </h3>
              <p className="text-sm mt-1 text-gray-200">
                {t('wizard.steps.basicInfo.proTipContent')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <div className="space-y-6 pt-4 border-t border-black">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-5 w-5 text-black" />
            {t('wizard.steps.location.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black text-white rounded-lg p-4">
              <p className="text-sm flex items-start">
                <Info className="h-4 w-4 inline-block mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('wizard.steps.location.infoText')}</span>
              </p>
            </div>
          </div>
          
          {/* Country selection first */}
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t('wizard.steps.location.countryLabel')}</Label>
                <Select value={selectedCountryCode} onValueChange={handleCountryChange}>
                  <SelectTrigger className="border-black focus:border-black focus:ring-black">
                    <SelectValue placeholder={t('wizard.steps.location.countryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(countryConfigurations).map(([code, config]) => (
                      <SelectItem key={code} value={code}>{config.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Show exact address toggle */}
          <div className="flex items-center justify-between border-t border-black pt-4">
            <div className="space-y-0.5">
              <Label className="text-base cursor-pointer" htmlFor="show-exact-address">
                {t('wizard.steps.location.addressToggleLabel')}
              </Label>
              <p className="text-sm text-gray-600">
                {t('wizard.steps.location.addressToggleDescription')}
              </p>
            </div>
            <Switch
              id="show-exact-address"
              checked={showExactAddress}
              onCheckedChange={handleExactAddressToggle}
              className="data-[state=checked]:bg-black"
            />
          </div>
          
          {/* Approximate Location (when exact address is disabled) */}
          {!showExactAddress && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="approximateLocation">{t('wizard.steps.location.approximateLocationLabel')}</Label>
                <Input
                  id="approximateLocation"
                  placeholder={t('wizard.steps.location.approximateLocationPlaceholder')}
                  value={propertyData.approximateLocation || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ approximateLocation: e.target.value })}
                  className="border-black focus:border-black focus:ring-black"
                />
              </div>
            </div>
          )}
          
          {/* Address details (conditional) */}
          {showExactAddress && (
            <div className="space-y-4 pt-4">
              <h3 className="font-medium">{t('wizard.steps.location.addressDetails')}</h3>
              
              {/* Address Autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="address-autocomplete">{t('wizard.steps.location.addressLabel')}</Label>
                <AddressAutocomplete
                  value={propertyData.address || ''}
                  onChange={(value) => updatePropertyData({ address: value })}
                  onAddressSelect={(result) => {
                    // Update all address components and coordinates
                    const addressComponents = result.addressComponents;
                    updatePropertyData({
                      address: result.address,
                      city: addressComponents.city || '',
                      state: addressComponents.state || '',
                      zipCode: addressComponents.zipCode || '',
                      country: addressComponents.country || '',
                      latitude: result.coordinates.latitude,
                      longitude: result.coordinates.longitude
                    });
                    
                    // Update country selection
                    const countryCode = Object.keys(countryConfigurations).find(code => 
                      countryConfigurations[code as keyof typeof countryConfigurations].name === addressComponents.country
                    );
                    if (countryCode) {
                      setSelectedCountryCode(countryCode);
                    }
                    
                    // Set geocoding status to success
                    setGeocodingStatus('success');
                  }}
                  placeholder={t('wizard.steps.location.addressPlaceholder')}
                  disabled={isGeocoding}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-manual">{t('wizard.steps.location.addressLabel')} (Manual)</Label>
                  <Input
                    id="address-manual"
                    placeholder={t('wizard.steps.location.addressPlaceholder')}
                    value={propertyData.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ address: e.target.value })}
                    className="border-black focus:border-black focus:ring-black"
                  />
                  <p className="text-xs text-gray-500">
                    Use the autocomplete above or enter manually
                  </p>
                </div>
                
                {/* State Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="state">{t('wizard.steps.location.stateLabel')}</Label>
                  {selectedCountryCode && countryConfigurations[selectedCountryCode as keyof typeof countryConfigurations].states ? (
                    <Select 
                      value={propertyData.state || ''} 
                      onValueChange={(value: string) => updatePropertyData({ state: value })}
                    >
                      <SelectTrigger className="border-black focus:border-black focus:ring-black">
                        <SelectValue placeholder={t('wizard.steps.location.statePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countryConfigurations[selectedCountryCode as keyof typeof countryConfigurations].states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      placeholder={t('wizard.steps.location.statePlaceholder')}
                      value={propertyData.state || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ state: e.target.value })}
                      className="border-black focus:border-black focus:ring-black"
                    />
                  )}
                </div>
                
                {/* City - Dropdown for major cities if available, otherwise input */}
                <div className="space-y-2">
                  <Label htmlFor="city">{t('wizard.steps.location.cityLabel')}</Label>
                  {selectedCountryCode && countryConfigurations[selectedCountryCode as keyof typeof countryConfigurations].majorCities ? (
                    <Select 
                      value={propertyData.city || ''} 
                      onValueChange={(value: string) => updatePropertyData({ city: value })}
                    >
                      <SelectTrigger className="border-black focus:border-black focus:ring-black">
                        <SelectValue placeholder={t('wizard.steps.location.cityPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countryConfigurations[selectedCountryCode as keyof typeof countryConfigurations].majorCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="city"
                      placeholder={t('wizard.steps.location.cityPlaceholder')}
                      value={propertyData.city || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ city: e.target.value })}
                      className="border-black focus:border-black focus:ring-black"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t('wizard.steps.location.zipCodeLabel')}</Label>
                  <Input
                    id="zipCode"
                    placeholder={t('wizard.steps.location.zipCodePlaceholder')}
                    value={propertyData.zipCode || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ zipCode: e.target.value })}
                    className="border-black focus:border-black focus:ring-black"
                  />
                </div>
              </div>
              
              {/* Geocoding Status Indicator */}
              {showExactAddress && (propertyData.address || propertyData.city) && (
                <div className="mt-4 p-3 rounded-lg border">
                  {isGeocoding && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Geocoding address...</span>
                    </div>
                  )}
                  
                  {geocodingStatus === 'success' && !isGeocoding && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Address geocoded successfully 
                        {propertyData.latitude && propertyData.longitude && 
                          ` (${propertyData.latitude.toFixed(4)}, ${propertyData.longitude.toFixed(4)})`
                        }
                      </span>
                    </div>
                  )}
                  
                  {geocodingStatus === 'error' && !isGeocoding && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Geocoding failed: {geocodingError}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Interactive Map */}
              {showExactAddress && (
                <div className="mt-6">
                  <PropertyLocationMap
                    latitude={propertyData.latitude}
                    longitude={propertyData.longitude}
                    address={composeAddress({
                      address: propertyData.address,
                      city: propertyData.city,
                      state: propertyData.state,
                      zipCode: propertyData.zipCode,
                      country: propertyData.country
                    })}
                    onLocationChange={(location) => {
                      updatePropertyData({
                        latitude: location.latitude,
                        longitude: location.longitude,
                        address: location.address
                      });
                      setGeocodingStatus('success');
                    }}
                    disabled={isGeocoding}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Contact Information */}
          <div className="space-y-4 border-t border-black pt-4 mt-4">
                          <h3 className="font-medium">{t('wizard.steps.location.contactDetails')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Email Field */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactEmail">{t('wizard.steps.location.contactEmailLabel')} *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder={t('wizard.steps.location.contactEmailPlaceholder')}
                  value={propertyData.contactEmail || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ contactEmail: e.target.value })}
                  className="border-black focus:border-black focus:ring-black"
                  required
                />
              </div>

              {/* Phone Number Fields */}
              <div className="space-y-2">
                <Label htmlFor="phoneCountryCode">{t('wizard.steps.location.phoneCountryCodeLabel')} *</Label>
                <Input
                  id="phoneCountryCode"
                  placeholder={t('wizard.steps.location.phoneCountryCodePlaceholder')}
                  value={propertyData.phoneCountryCode || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ phoneCountryCode: e.target.value })}
                  className="border-black focus:border-black focus:ring-black w-24" // Added w-24 for smaller width
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('wizard.steps.location.phoneNumberLabel')} *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={t('wizard.steps.location.phoneNumberPlaceholder')}
                  value={propertyData.phoneNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePropertyData({ phoneNumber: e.target.value })}
                  className="border-black focus:border-black focus:ring-black"
                  required
                />
              </div>
              
              {/* Make Phone Public Toggle */}
              <div className="flex items-center justify-between md:col-span-2 border-t border-black pt-4 mt-4">
                <div className="space-y-0.5">
                  <Label className="text-base cursor-pointer" htmlFor="isPhoneNumberPublic">
                    {t('wizard.steps.location.isPhoneNumberPublicLabel')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('wizard.steps.location.isPhoneNumberPublicDescription')}
                  </p>
                </div>
                <Switch
                  id="isPhoneNumberPublic"
                  checked={propertyData.isPhoneNumberPublic === undefined ? true : propertyData.isPhoneNumberPublic} // Default to true if undefined
                  onCheckedChange={(checked: boolean) => updatePropertyData({ isPhoneNumberPublic: checked })}
                  className="data-[state=checked]:bg-black"
                />
              </div>
            </div>
          </div>
                  </div>
        </div>
      </div>
    );
} 