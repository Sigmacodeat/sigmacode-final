// Mock für next/image
import React from 'react';

const Image = ({
  src,
  alt = '',
  width,
  height,
  fill,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  unoptimized = false,
  onLoadingComplete,
  onLoad,
  onError,
  className,
  style,
  ...props
}: any) => {
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) onLoad(e);
    if (onLoadingComplete) onLoadingComplete({ naturalWidth: width, naturalHeight: height });
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onError) onError(e);
  };

  const imageStyle = {
    ...style,
    ...(fill ? { position: 'absolute', height: '100%', width: '100%' } : { width, height }),
    objectFit: 'cover',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={imageStyle}
      onLoad={handleLoad}
      onError={handleError}
      data-testid="next-image"
      data-src={src}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-priority={priority}
      data-placeholder={placeholder}
      data-unoptimized={unoptimized}
      {...props}
    />
  );
};

export default Image;
