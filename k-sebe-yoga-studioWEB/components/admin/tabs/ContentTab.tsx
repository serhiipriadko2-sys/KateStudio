import React from 'react';
import { AdminTabProps } from '../types';
import { ArticlesTab } from './ArticlesTab';

export const ContentTab: React.FC<AdminTabProps> = (props) => {
  return <ArticlesTab {...props} />;
};
