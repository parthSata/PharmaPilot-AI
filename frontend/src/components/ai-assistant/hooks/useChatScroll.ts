import { useRef, useEffect } from 'react';

export const useChatScroll = (dependencies: any[]) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, dependencies);

  return ref;
};
