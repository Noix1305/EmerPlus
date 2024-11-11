declare global {
    interface Window {
      onRegionChange: (regionSelect: HTMLSelectElement) => Promise<void>;
    }
  }
  
  export {};