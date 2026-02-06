import React from 'react';
import { Image as SharedImage } from '../../shared/components';
import { imageStorageAdapter } from '../../shared/services';

type ImageProps = React.ComponentProps<typeof SharedImage>;

const defaultServices = {
  ...imageStorageAdapter,
};

export const Image: React.FC<ImageProps> = ({ enableAnalysis, services, ...props }) => {
  const mergedServices = { ...defaultServices, ...services };

  return (
    <SharedImage {...props} enableAnalysis={enableAnalysis ?? false} services={mergedServices} />
  );
};
