import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import SpatialSearch from '@/components/search/SpatialSearch';
import { useTranslation } from 'react-i18next';

const SpatialSearchPage: React.FC = () => {
  const { t } = useTranslation('search');

  return (
    <BaseLayout>
      <SpatialSearch />
    </BaseLayout>
  );
};

export default SpatialSearchPage;