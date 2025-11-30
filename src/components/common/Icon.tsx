/**
 * Icon component wrapper for Material Design Icons
 */

import React from 'react';
import MdiIcon from '@mdi/react';

interface IconProps {
  path: string;
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  path,
  size = 1,
  className = '',
  color
}) => {
  return (
    <MdiIcon
      path={path}
      size={size}
      className={className}
      color={color}
    />
  );
};
