import React from 'react';
import { Image as SharedImage } from '../../shared/components';
import { imageStorageAdapter } from '../../shared/services';
import { analyzeImageContent } from '../services/geminiService';

type ImageProps = React.ComponentProps<typeof SharedImage>;

const defaultServices = {
  ...imageStorageAdapter,
  analyzeImage: analyzeImageContent,
};

export const Image: React.FC<ImageProps> = ({ enableAnalysis, services, ...props }) => {
  const mergedServices = { ...defaultServices, ...services };

  return (
    <SharedImage {...props} enableAnalysis={enableAnalysis ?? true} services={mergedServices} />
  );
};
