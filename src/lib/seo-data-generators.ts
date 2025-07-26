/**
 * SEO Data Generators for Enhanced Structured Data
 * Utilities to generate common FAQ content and structured data
 */

import type { FAQItem, PriceHistoryItem, VirtualTourData, AgentReview } from '@/components/seo/EnhancedStructuredData';

// Property FAQ Generator
export function generatePropertyFAQs(property: any, locale: string = 'en-US'): FAQItem[] {
  const translations = {
    'en-US': {
      parking: 'Is parking available?',
      parkingAnswer: 'Yes, this property includes {count} parking space(s).',
      noParkingAnswer: 'No parking is available with this property.',
      pets: 'Are pets allowed?',
      petsAnswer: 'Yes, pets are welcome in this property.',
      noPetsAnswer: 'No pets are allowed in this property.',
      furnished: 'Is the property furnished?',
      furnishedAnswer: 'Yes, this property comes fully furnished.',
      unfurnishedAnswer: 'No, this property is unfurnished.',
      utilities: 'What utilities are included?',
      utilitiesAnswer: 'The following utilities are included: {utilities}.',
      noUtilitiesAnswer: 'Utilities are not included and are the responsibility of the tenant.',
      lease: 'What is the minimum lease term?',
      leaseAnswer: 'The minimum lease term is {term} months.',
      viewing: 'How can I schedule a viewing?',
      viewingAnswer: 'You can schedule a viewing by contacting our office or using the booking system on our website.',
      neighborhood: 'What is the neighborhood like?',
      neighborhoodAnswer: 'This property is located in {area}, known for {features}.',
      transport: 'What transportation options are available?',
      transportAnswer: 'The property is well-connected with {transport} nearby.',
      price: 'Is the price negotiable?',
      priceAnswer: 'Please contact our agents to discuss pricing and any potential negotiations.',
      deposit: 'What is the security deposit?',
      depositAnswer: 'The security deposit is typically equivalent to {months} month(s) of rent.'
    },
    'es-ES': {
      parking: '¿Hay aparcamiento disponible?',
      parkingAnswer: 'Sí, esta propiedad incluye {count} plaza(s) de aparcamiento.',
      noParkingAnswer: 'No hay aparcamiento disponible con esta propiedad.',
      pets: '¿Se permiten mascotas?',
      petsAnswer: 'Sí, las mascotas son bienvenidas en esta propiedad.',
      noPetsAnswer: 'No se permiten mascotas en esta propiedad.',
      furnished: '¿Está amueblada la propiedad?',
      furnishedAnswer: 'Sí, esta propiedad viene completamente amueblada.',
      unfurnishedAnswer: 'No, esta propiedad no está amueblada.',
      utilities: '¿Qué servicios están incluidos?',
      utilitiesAnswer: 'Los siguientes servicios están incluidos: {utilities}.',
      noUtilitiesAnswer: 'Los servicios no están incluidos y son responsabilidad del inquilino.',
      lease: '¿Cuál es el plazo mínimo de alquiler?',
      leaseAnswer: 'El plazo mínimo de alquiler es de {term} meses.',
      viewing: '¿Cómo puedo programar una visita?',
      viewingAnswer: 'Puede programar una visita contactando nuestra oficina o usando el sistema de reservas en nuestro sitio web.',
      neighborhood: '¿Cómo es el barrio?',
      neighborhoodAnswer: 'Esta propiedad está ubicada en {area}, conocida por {features}.',
      transport: '¿Qué opciones de transporte hay disponibles?',
      transportAnswer: 'La propiedad está bien conectada con {transport} cercano.',
      price: '¿Es negociable el precio?',
      priceAnswer: 'Por favor contacte a nuestros agentes para discutir el precio y posibles negociaciones.',
      deposit: '¿Cuál es el depósito de seguridad?',
      depositAnswer: 'El depósito de seguridad es típicamente equivalente a {months} mes(es) de alquiler.'
    },
    'fr-FR': {
      parking: 'Y a-t-il un parking disponible?',
      parkingAnswer: 'Oui, cette propriété comprend {count} place(s) de parking.',
      noParkingAnswer: 'Aucun parking n\'est disponible avec cette propriété.',
      pets: 'Les animaux sont-ils autorisés?',
      petsAnswer: 'Oui, les animaux sont les bienvenus dans cette propriété.',
      noPetsAnswer: 'Les animaux ne sont pas autorisés dans cette propriété.',
      furnished: 'La propriété est-elle meublée?',
      furnishedAnswer: 'Oui, cette propriété est entièrement meublée.',
      unfurnishedAnswer: 'Non, cette propriété n\'est pas meublée.',
      utilities: 'Quels services sont inclus?',
      utilitiesAnswer: 'Les services suivants sont inclus: {utilities}.',
      noUtilitiesAnswer: 'Les services ne sont pas inclus et sont à la charge du locataire.',
      lease: 'Quelle est la durée minimale du bail?',
      leaseAnswer: 'La durée minimale du bail est de {term} mois.',
      viewing: 'Comment puis-je programmer une visite?',
      viewingAnswer: 'Vous pouvez programmer une visite en contactant notre bureau ou en utilisant le système de réservation sur notre site web.',
      neighborhood: 'Comment est le quartier?',
      neighborhoodAnswer: 'Cette propriété est située dans {area}, connue pour {features}.',
      transport: 'Quelles options de transport sont disponibles?',
      transportAnswer: 'La propriété est bien desservie avec {transport} à proximité.',
      price: 'Le prix est-il négociable?',
      priceAnswer: 'Veuillez contacter nos agents pour discuter du prix et d\'éventuelles négociations.',
      deposit: 'Quel est le dépôt de garantie?',
      depositAnswer: 'Le dépôt de garantie équivaut généralement à {months} mois de loyer.'
    },
    'de-DE': {
      parking: 'Ist ein Parkplatz verfügbar?',
      parkingAnswer: 'Ja, diese Immobilie verfügt über {count} Parkplatz/Parkplätze.',
      noParkingAnswer: 'Kein Parkplatz ist bei dieser Immobilie verfügbar.',
      pets: 'Sind Haustiere erlaubt?',
      petsAnswer: 'Ja, Haustiere sind in dieser Immobilie willkommen.',
      noPetsAnswer: 'Haustiere sind in dieser Immobilie nicht erlaubt.',
      furnished: 'Ist die Immobilie möbliert?',
      furnishedAnswer: 'Ja, diese Immobilie ist vollständig möbliert.',
      unfurnishedAnswer: 'Nein, diese Immobilie ist unmöbliert.',
      utilities: 'Welche Nebenkosten sind enthalten?',
      utilitiesAnswer: 'Die folgenden Nebenkosten sind enthalten: {utilities}.',
      noUtilitiesAnswer: 'Nebenkosten sind nicht enthalten und liegen in der Verantwortung des Mieters.',
      lease: 'Wie lange ist die Mindestmietdauer?',
      leaseAnswer: 'Die Mindestmietdauer beträgt {term} Monate.',
      viewing: 'Wie kann ich eine Besichtigung vereinbaren?',
      viewingAnswer: 'Sie können eine Besichtigung vereinbaren, indem Sie unser Büro kontaktieren oder das Buchungssystem auf unserer Website nutzen.',
      neighborhood: 'Wie ist die Nachbarschaft?',
      neighborhoodAnswer: 'Diese Immobilie befindet sich in {area}, bekannt für {features}.',
      transport: 'Welche Transportmöglichkeiten gibt es?',
      transportAnswer: 'Die Immobilie ist gut angebunden mit {transport} in der Nähe.',
      price: 'Ist der Preis verhandelbar?',
      priceAnswer: 'Bitte kontaktieren Sie unsere Makler, um über den Preis und mögliche Verhandlungen zu sprechen.',
      deposit: 'Wie hoch ist die Kaution?',
      depositAnswer: 'Die Kaution entspricht normalerweise {months} Monatsmiete(n).'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations['en-US'];
  const faqs: FAQItem[] = [];

  // Parking FAQ
  if (property.parking) {
    faqs.push({
      question: t.parking,
      answer: t.parkingAnswer.replace('{count}', property.parking.toString())
    });
  } else {
    faqs.push({
      question: t.parking,
      answer: t.noParkingAnswer
    });
  }

  // Pets FAQ
  faqs.push({
    question: t.pets,
    answer: property.petsAllowed ? t.petsAnswer : t.noPetsAnswer
  });

  // Furnished FAQ
  faqs.push({
    question: t.furnished,
    answer: property.furnished ? t.furnishedAnswer : t.unfurnishedAnswer
  });

  // Utilities FAQ
  if (property.utilities && property.utilities.length > 0) {
    faqs.push({
      question: t.utilities,
      answer: t.utilitiesAnswer.replace('{utilities}', property.utilities.join(', '))
    });
  } else {
    faqs.push({
      question: t.utilities,
      answer: t.noUtilitiesAnswer
    });
  }

  // Lease term FAQ (for rentals)
  if (property.listingType === 'rent' && property.minLeaseTerm) {
    faqs.push({
      question: t.lease,
      answer: t.leaseAnswer.replace('{term}', property.minLeaseTerm.toString())
    });
  }

  // Viewing FAQ
  faqs.push({
    question: t.viewing,
    answer: t.viewingAnswer
  });

  // Neighborhood FAQ
  if (property.neighborhood) {
    faqs.push({
      question: t.neighborhood,
      answer: t.neighborhoodAnswer
        .replace('{area}', property.neighborhood.name)
        .replace('{features}', property.neighborhood.features?.join(', ') || 'its great amenities')
    });
  }

  // Transportation FAQ
  if (property.transportation && property.transportation.length > 0) {
    faqs.push({
      question: t.transport,
      answer: t.transportAnswer.replace('{transport}', property.transportation.join(', '))
    });
  }

  // Price FAQ
  faqs.push({
    question: t.price,
    answer: t.priceAnswer
  });

  // Deposit FAQ (for rentals)
  if (property.listingType === 'rent') {
    faqs.push({
      question: t.deposit,
      answer: t.depositAnswer.replace('{months}', property.depositMonths?.toString() || '1-2')
    });
  }

  return faqs;
}

// Generate common real estate FAQs for general pages
export function generateGeneralRealEstateFAQs(locale: string = 'en-US'): FAQItem[] {
  const translations = {
    'en-US': {
      buyingProcess: 'What is the home buying process?',
      buyingProcessAnswer: 'The home buying process typically involves: 1) Getting pre-approved for a mortgage, 2) Finding a property, 3) Making an offer, 4) Home inspection, 5) Finalizing financing, 6) Closing on the property.',
      sellingProcess: 'How do I sell my property?',
      sellingProcessAnswer: 'To sell your property: 1) Get a market valuation, 2) Prepare your home for sale, 3) List with a real estate agent, 4) Show to potential buyers, 5) Negotiate offers, 6) Complete the sale.',
      fees: 'What fees are involved in buying/selling?',
      feesAnswer: 'Common fees include: real estate agent commission, closing costs, inspection fees, appraisal fees, title insurance, and transfer taxes. These vary by location and property value.',
      timeline: 'How long does it take to buy/sell a property?',
      timelineAnswer: 'The typical timeline is 30-60 days from offer acceptance to closing. However, this can vary based on financing, inspections, and market conditions.',
      marketValue: 'How is property value determined?',
      marketValueAnswer: 'Property value is determined by factors including: location, size, condition, recent comparable sales, market trends, and local amenities.',
      inspection: 'Do I need a home inspection?',
      inspectionAnswer: 'While not always required, a home inspection is highly recommended to identify potential issues before purchase. It can help you make an informed decision and potentially negotiate repairs.'
    },
    'es-ES': {
      buyingProcess: '¿Cuál es el proceso de compra de una vivienda?',
      buyingProcessAnswer: 'El proceso de compra típicamente involucra: 1) Obtener preaprobación hipotecaria, 2) Encontrar una propiedad, 3) Hacer una oferta, 4) Inspección de la vivienda, 5) Finalizar financiación, 6) Cierre de la propiedad.',
      sellingProcess: '¿Cómo vendo mi propiedad?',
      sellingProcessAnswer: 'Para vender su propiedad: 1) Obtener una valoración de mercado, 2) Preparar su hogar para la venta, 3) Listar con un agente inmobiliario, 4) Mostrar a compradores potenciales, 5) Negociar ofertas, 6) Completar la venta.',
      fees: '¿Qué costos están involucrados en comprar/vender?',
      feesAnswer: 'Los costos comunes incluyen: comisión del agente inmobiliario, gastos de cierre, tasas de inspección, tasas de evaluación, seguro de título, e impuestos de transferencia. Estos varían según la ubicación y valor de la propiedad.',
      timeline: '¿Cuánto tiempo toma comprar/vender una propiedad?',
      timelineAnswer: 'El plazo típico es de 30-60 días desde la aceptación de la oferta hasta el cierre. Sin embargo, esto puede variar según el financiamiento, inspecciones y condiciones del mercado.',
      marketValue: '¿Cómo se determina el valor de la propiedad?',
      marketValueAnswer: 'El valor de la propiedad se determina por factores que incluyen: ubicación, tamaño, condición, ventas comparables recientes, tendencias del mercado y servicios locales.',
      inspection: '¿Necesito una inspección de la vivienda?',
      inspectionAnswer: 'Aunque no siempre es requerida, una inspección de la vivienda es altamente recomendada para identificar problemas potenciales antes de la compra. Puede ayudarle a tomar una decisión informada y potencialmente negociar reparaciones.'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations['en-US'];

  return [
    {
      question: t.buyingProcess,
      answer: t.buyingProcessAnswer
    },
    {
      question: t.sellingProcess,
      answer: t.sellingProcessAnswer
    },
    {
      question: t.fees,
      answer: t.feesAnswer
    },
    {
      question: t.timeline,
      answer: t.timelineAnswer
    },
    {
      question: t.marketValue,
      answer: t.marketValueAnswer
    },
    {
      question: t.inspection,
      answer: t.inspectionAnswer
    }
  ];
}

// Generate mock price history for demonstration
export function generateMockPriceHistory(property: any): PriceHistoryItem[] {
  const currentPrice = property.price || 500000;
  const currency = property.currency || 'EUR';
  const now = new Date();
  
  const history: PriceHistoryItem[] = [];
  
  // Generate 6 months of price history
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    let price = currentPrice;
    let changeReason = '';
    
    if (i === 5) {
      price = currentPrice * 1.05; // 5% higher 5 months ago
      changeReason = 'Initial listing';
    } else if (i === 3) {
      price = currentPrice * 1.02; // 2% higher 3 months ago
      changeReason = 'Market adjustment';
    } else if (i === 1) {
      price = currentPrice * 1.01; // 1% higher 1 month ago
      changeReason = 'Price reduction';
    } else if (i === 0) {
      price = currentPrice; // Current price
      changeReason = 'Current listing price';
    }
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      currency,
      priceType: property.listingType === 'rent' ? 'rent' : 'sale',
      changeReason: changeReason || undefined
    });
  }
  
  return history;
}

// Generate mock agent reviews
export function generateMockAgentReviews(agentId: string): AgentReview[] {
  const reviews: AgentReview[] = [
    {
      reviewId: `${agentId}_review_1`,
      reviewer: {
        name: 'Maria Rodriguez',
        image: '/images/reviewers/maria.jpg'
      },
      rating: 5,
      reviewText: 'Excellent service! The agent was very professional and helped us find the perfect home. Highly recommended!',
      datePublished: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      wouldRecommend: true
    },
    {
      reviewId: `${agentId}_review_2`,
      reviewer: {
        name: 'John Smith',
        image: '/images/reviewers/john.jpg'
      },
      rating: 4,
      reviewText: 'Great experience working with this agent. Very knowledgeable about the local market and responsive to our needs.',
      datePublished: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
      wouldRecommend: true
    },
    {
      reviewId: `${agentId}_review_3`,
      reviewer: {
        name: 'Sophie Martin',
        image: '/images/reviewers/sophie.jpg'
      },
      rating: 5,
      reviewText: 'Outstanding service from start to finish. The agent went above and beyond to ensure a smooth transaction.',
      datePublished: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
      wouldRecommend: true
    }
  ];

  return reviews;
}

// Calculate agent rating statistics
export function calculateAgentRatingStats(reviews: AgentReview[]) {
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews
  };
}

// Generate virtual tour data
export function generateVirtualTourData(property: any): VirtualTourData | null {
  // Check if property has virtual tour data
  if (!property.virtualTour && !property.images?.length) {
    return null;
  }

  const tourTypes: ('360' | 'video' | 'slideshow')[] = ['360', 'video', 'slideshow'];
  const randomType = tourTypes[Math.floor(Math.random() * tourTypes.length)];

  return {
    tourUrl: property.virtualTour || `/virtual-tour/${property.id}`,
    tourType: randomType,
    duration: randomType === 'video' ? Math.floor(Math.random() * 5) + 3 : undefined, // 3-8 minutes for video
    description: `${randomType === '360' ? '360-degree' : randomType} virtual tour of ${property.title}`,
    thumbnailUrl: property.images?.[0] || `/images/properties/${property.id}/thumbnail.jpg`
  };
}