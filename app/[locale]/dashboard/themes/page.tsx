/**
 * Advanced Theme & Accessibility Settings
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Eye,
  Volume2,
  VolumeX,
  Type,
  ZoomIn,
  MousePointer,
  Keyboard,
  Accessibility,
  Check,
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Heart,
  Zap,
  Coffee,
  Star,
  Gem,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface ThemeConfig {
  name: string;
  mode: 'light' | 'dark' | 'system';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'default' | 'serif' | 'mono';
}

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number;
  lineHeight: number;
}

interface PresetTheme {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  config: Partial<ThemeConfig>;
}

const presetThemes: PresetTheme[] = [
  {
    id: 'default',
    name: 'Default',
    icon: Palette,
    description: 'Clean and professional',
    config: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    icon: Heart,
    description: 'Calm blue tones',
    config: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0891b2',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    icon: Zap,
    description: 'Nature-inspired greens',
    config: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#065f46',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    icon: Coffee,
    description: 'Warm sunset colors',
    config: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#c2410c',
    },
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    icon: Star,
    description: 'Elegant purple theme',
    config: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#6d28d9',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    icon: Gem,
    description: 'Deep dark theme',
    config: {
      mode: 'dark',
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#3730a3',
    },
  },
];

export default function ThemeSettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [activeTab, setActiveTab] = useState<'themes' | 'accessibility' | 'advanced'>('themes');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>({
    name: 'Default',
    mode: 'system',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    foreground: '#000000',
    border: '#e5e7eb',
    radius: 'md',
    fontSize: 'md',
    fontFamily: 'default',
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindMode: 'none',
    fontSize: 16,
    lineHeight: 1.5,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from localStorage or API
      const savedTheme = localStorage.getItem('theme-config');
      const savedAccessibility = localStorage.getItem('accessibility-settings');

      if (savedTheme) {
        setCurrentTheme(JSON.parse(savedTheme));
      }
      if (savedAccessibility) {
        setAccessibilitySettings(JSON.parse(savedAccessibility));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem('theme-config', JSON.stringify(currentTheme));
      localStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings));
      setHasUnsavedChanges(false);

      // Apply theme changes
      applyTheme(currentTheme);
      applyAccessibility(accessibilitySettings);

      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    root.style.setProperty('--border', theme.border);

    // Set data attributes for theme mode
    if (theme.mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme.mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    // Apply font settings
    root.style.fontSize =
      theme.fontSize === 'sm'
        ? '14px'
        : theme.fontSize === 'lg'
          ? '18px'
          : theme.fontSize === 'xl'
            ? '20px'
            : '16px';
    root.style.fontFamily =
      theme.fontFamily === 'serif'
        ? 'serif'
        : theme.fontFamily === 'mono'
          ? 'monospace'
          : 'inherit';

    // Apply border radius
    const radiusValue =
      theme.radius === 'none'
        ? '0'
        : theme.radius === 'sm'
          ? '0.25rem'
          : theme.radius === 'lg'
            ? '0.75rem'
            : theme.radius === 'xl'
              ? '1rem'
              : '0.5rem';
    root.style.setProperty('--radius', radiusValue);
  };

  const applyAccessibility = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    if (settings.largeText) {
      root.style.fontSize = '18px';
    }

    root.style.lineHeight = settings.lineHeight.toString();

    if (settings.colorBlindMode !== 'none') {
      root.setAttribute('data-color-blind', settings.colorBlindMode);
    } else {
      root.removeAttribute('data-color-blind');
    }
  };

  const applyPresetTheme = (preset: PresetTheme) => {
    const newTheme = { ...currentTheme, ...preset.config };
    setCurrentTheme(newTheme);
    setHasUnsavedChanges(true);
  };

  const resetToDefaults = () => {
    setCurrentTheme({
      name: 'Default',
      mode: 'system',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#000000',
      border: '#e5e7eb',
      radius: 'md',
      fontSize: 'md',
      fontFamily: 'default',
    });
    setAccessibilitySettings({
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindMode: 'none',
      fontSize: 16,
      lineHeight: 1.5,
    });
    setHasUnsavedChanges(true);
  };

  const exportSettings = () => {
    const settings = {
      theme: currentTheme,
      accessibility: accessibilitySettings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.theme) setCurrentTheme(settings.theme);
        if (settings.accessibility) setAccessibilitySettings(settings.accessibility);
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Theme & Accessibility</h1>
            <p className="text-sm text-muted-foreground">
              Customize your experience with themes and accessibility settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
          <button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'themes', label: 'Themes', icon: Palette },
          { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
          { id: 'advanced', label: 'Advanced', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'themes' && (
        <div className="space-y-8">
          {/* Theme Mode */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Mode</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { mode: 'light', icon: Sun, label: 'Light' },
                { mode: 'dark', icon: Moon, label: 'Dark' },
                { mode: 'system', icon: Monitor, label: 'System' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCurrentTheme({ ...currentTheme, mode: mode as any });
                    setHasUnsavedChanges(true);
                  }}
                  className={`flex flex-col items-center gap-3 p-6 border rounded-lg hover:bg-accent transition-colors ${
                    currentTheme.mode === mode ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="font-medium">{label}</span>
                  {currentTheme.mode === mode && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Themes */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Preset Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presetThemes.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPresetTheme(preset)}
                  className="flex flex-col items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <preset.icon className="h-5 w-5" />
                    <span className="font-medium">{preset.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                  <div className="flex gap-1 mt-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.config.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.config.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.config.accent }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { key: 'primary', label: 'Primary', value: currentTheme.primary },
                { key: 'secondary', label: 'Secondary', value: currentTheme.secondary },
                { key: 'accent', label: 'Accent', value: currentTheme.accent },
              ].map(({ key, label, value }) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium">{label}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => {
                        setCurrentTheme({ ...currentTheme, [key]: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-12 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setCurrentTheme({ ...currentTheme, [key]: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="flex-1 px-3 py-1 border rounded text-sm font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Typography</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Size</label>
                <select
                  value={currentTheme.fontSize}
                  onChange={(e) => {
                    setCurrentTheme({ ...currentTheme, fontSize: e.target.value as any });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Font Family</label>
                <select
                  value={currentTheme.fontFamily}
                  onChange={(e) => {
                    setCurrentTheme({ ...currentTheme, fontFamily: e.target.value as any });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="default">Default</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Border Radius</label>
                <select
                  value={currentTheme.radius}
                  onChange={(e) => {
                    setCurrentTheme({ ...currentTheme, radius: e.target.value as any });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accessibility' && (
        <div className="space-y-8">
          {/* Vision Settings */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vision & Display
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: 'highContrast',
                  label: 'High Contrast Mode',
                  description: 'Increase contrast for better visibility',
                  icon: Eye,
                },
                {
                  key: 'largeText',
                  label: 'Large Text',
                  description: 'Increase text size throughout the application',
                  icon: Type,
                },
                {
                  key: 'reducedMotion',
                  label: 'Reduced Motion',
                  description: 'Minimize animations and transitions',
                  icon: MousePointer,
                },
              ].map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAccessibilitySettings({
                        ...accessibilitySettings,
                        [key]: !accessibilitySettings[key as keyof AccessibilitySettings],
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings[key as keyof AccessibilitySettings]
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings[key as keyof AccessibilitySettings]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color Blindness Support */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Color Blindness Support</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'none', label: 'None', description: 'Default colors' },
                { value: 'protanopia', label: 'Protanopia', description: 'Red-weak' },
                { value: 'deuteranopia', label: 'Deuteranopia', description: 'Green-weak' },
                { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-weak' },
              ].map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => {
                    setAccessibilitySettings({
                      ...accessibilitySettings,
                      colorBlindMode: value as any,
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className={`p-4 border rounded-lg text-left hover:bg-accent transition-colors ${
                    accessibilitySettings.colorBlindMode === value
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation & Interaction */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Navigation & Interaction
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: 'keyboardNavigation',
                  label: 'Keyboard Navigation',
                  description: 'Enable full keyboard navigation support',
                  icon: Keyboard,
                },
                {
                  key: 'focusIndicators',
                  label: 'Focus Indicators',
                  description: 'Show visible focus indicators for keyboard navigation',
                  icon: MousePointer,
                },
                {
                  key: 'screenReader',
                  label: 'Screen Reader Support',
                  description: 'Optimize content for screen readers',
                  icon: Volume2,
                },
              ].map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAccessibilitySettings({
                        ...accessibilitySettings,
                        [key]: !accessibilitySettings[key as keyof AccessibilitySettings],
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings[key as keyof AccessibilitySettings]
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings[key as keyof AccessibilitySettings]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Text Customization */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Customization
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Font Size: {accessibilitySettings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={accessibilitySettings.fontSize}
                  onChange={(e) => {
                    setAccessibilitySettings({
                      ...accessibilitySettings,
                      fontSize: parseInt(e.target.value),
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Line Height: {accessibilitySettings.lineHeight}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={accessibilitySettings.lineHeight}
                  onChange={(e) => {
                    setAccessibilitySettings({
                      ...accessibilitySettings,
                      lineHeight: parseFloat(e.target.value),
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-8">
          {/* Preview */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>
            <div className="space-y-4">
              <div className="p-4 bg-background border rounded-lg">
                <h4 className="text-foreground font-medium mb-2">Sample Content</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  This is how your content will look with the current theme settings.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                    Primary Button
                  </button>
                  <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                    Secondary Button
                  </button>
                  <button className="px-3 py-1 bg-accent text-accent-foreground rounded text-sm">
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Animations</p>
                  <p className="text-sm text-muted-foreground">
                    Control whether animations and transitions are enabled
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Preload Resources</p>
                  <p className="text-sm text-muted-foreground">
                    Preload fonts and critical resources for faster loading
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Export/Import */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Settings Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={exportSettings}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-accent transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Export Settings</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Import Settings</span>
                <input type="file" accept=".json" onChange={importSettings} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
