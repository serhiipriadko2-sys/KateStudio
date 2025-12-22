import React, { useMemo } from 'react';
import { Image as SharedImage } from '../../shared/components';
import { imageStorageAdapter } from '../../shared/services';
import { useToast } from '../context/ToastContext';

type ImageProps = React.ComponentProps<typeof SharedImage>;

export const Image: React.FC<ImageProps> = ({ services, ...props }) => {
  const { showToast } = useToast();

  const mergedServices = useMemo(
    () => ({
      ...imageStorageAdapter,
      showToast,
      ...services,
    }),
    [services, showToast]
  );

  return <SharedImage {...props} enableAnalysis={false} services={mergedServices} />;
};
