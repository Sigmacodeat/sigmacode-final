/**
 * AI Assistant - Advanced Code Generation & Analysis
 */

'use client';

import { useState, useRef } from 'react';
import {
  Code2,
  Lightbulb,
  FileText,
  GitBranch,
  Zap,
  Play,
  Copy,
  Download,
  Settings,
  Sparkles,
  Brain,
  Target,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface CodeGenerationRequest {
  type: 'component' | 'function' | 'api' | 'test' | 'config';
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust';
  description: string;
  context?: string;
  framework?: string;
}

interface CodeAnalysisResult {
  complexity: number;
  maintainability: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    suggestion?: string;
  }>;
  suggestions: string[];
}

export default function AIAssistantPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze' | 'refactor' | 'optimize'>(
    'generate',
  );
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const [generationRequest, setGenerationRequest] = useState<CodeGenerationRequest>({
    type: 'component',
    language: 'typescript',
    description: '',
    framework: 'react',
  });

  const generateCode = async () => {
    if (!generationRequest.description.trim()) return;

    setIsLoading(true);
    try {
      // Mock AI generation - in production, this would call your AI service
      const mockGeneratedCode = await mockCodeGeneration(generationRequest);
      setGeneratedCode(mockGeneratedCode);
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      // Mock code analysis - in production, this would call your AI service
      const mockAnalysis = await mockCodeAnalysis(code);
      setAnalysisResult(mockAnalysis);
    } catch (error) {
      console.error('Code analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refactorCode = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      // Mock code refactoring - in production, this would call your AI service
      const mockRefactoredCode = await mockCodeRefactoring(code);
      setGeneratedCode(mockRefactoredCode);
    } catch (error) {
      console.error('Code refactoring failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeCode = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      // Mock code optimization - in production, this would call your AI service
      const mockOptimizedCode = await mockCodeOptimization(code);
      setGeneratedCode(mockOptimizedCode);
    } catch (error) {
      console.error('Code optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Advanced code generation, analysis, and optimization powered by AI
          </p>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'generate', label: 'Generate Code', icon: Code2 },
          { id: 'analyze', label: 'Analyze Code', icon: Target },
          { id: 'refactor', label: 'Refactor Code', icon: GitBranch },
          { id: 'optimize', label: 'Optimize Code', icon: Zap },
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

      {/* Content Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-6">
          {activeTab === 'generate' && (
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Code Generation
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={generationRequest.type}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="component">Component</option>
                    <option value="function">Function</option>
                    <option value="api">API Route</option>
                    <option value="test">Test</option>
                    <option value="config">Configuration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={generationRequest.language}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({ ...prev, language: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={generationRequest.description}
                  onChange={(e) =>
                    setGenerationRequest((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what you want to generate..."
                  className="w-full px-3 py-2 border rounded-md h-24 resize-none"
                />
              </div>

              {generationRequest.language === 'typescript' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Framework</label>
                  <select
                    value={generationRequest.framework}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({ ...prev, framework: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="express">Express</option>
                    <option value="nestjs">NestJS</option>
                  </select>
                </div>
              )}

              <button
                onClick={generateCode}
                disabled={isLoading || !generationRequest.description.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Code
                  </>
                )}
              </button>
            </div>
          )}

          {(activeTab === 'analyze' || activeTab === 'refactor' || activeTab === 'optimize') && (
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {activeTab === 'analyze' && <Target className="h-5 w-5" />}
                {activeTab === 'refactor' && <GitBranch className="h-5 w-5" />}
                {activeTab === 'optimize' && <Zap className="h-5 w-5" />}
                {activeTab === 'analyze'
                  ? 'Code Analysis'
                  : activeTab === 'refactor'
                    ? 'Code Refactoring'
                    : 'Code Optimization'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Code to Analyze</label>
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full px-3 py-2 border rounded-md h-64 font-mono text-sm resize-none"
                />
              </div>

              <button
                onClick={
                  activeTab === 'analyze'
                    ? analyzeCode
                    : activeTab === 'refactor'
                      ? refactorCode
                      : optimizeCode
                }
                disabled={isLoading || !code.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {activeTab === 'analyze'
                      ? 'Analyze Code'
                      : activeTab === 'refactor'
                        ? 'Refactor Code'
                        : 'Optimize Code'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Result</h3>
            {(generatedCode || analysisResult) && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(generatedCode || JSON.stringify(analysisResult, null, 2))
                  }
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
                {generatedCode && (
                  <button
                    onClick={() => downloadCode('generated-code.ts', generatedCode)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                )}
              </div>
            )}
          </div>

          {activeTab === 'generate' && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  <span className="ml-3">Generating code...</span>
                </div>
              ) : generatedCode ? (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  <code>{generatedCode}</code>
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated code will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyze' && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  <span className="ml-3">Analyzing code...</span>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {analysisResult.complexity}
                      </p>
                      <p className="text-sm text-muted-foreground">Complexity Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analysisResult.maintainability}%
                      </p>
                      <p className="text-sm text-muted-foreground">Maintainability</p>
                    </div>
                  </div>

                  {/* Issues */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Issues Found ({analysisResult.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${
                            issue.type === 'error'
                              ? 'border-red-500 bg-red-50'
                              : issue.type === 'warning'
                                ? 'border-yellow-500 bg-yellow-50'
                                : 'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                issue.type === 'error'
                                  ? 'bg-red-500'
                                  : issue.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{issue.message}</p>
                              <p className="text-xs text-muted-foreground">Line {issue.line}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-green-600 mt-1">💡 {issue.suggestion}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-medium mb-3">Improvement Suggestions</h4>
                    <ul className="space-y-2">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Code analysis results will appear here</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'refactor' || activeTab === 'optimize') && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  <span className="ml-3">
                    {activeTab === 'refactor' ? 'Refactoring code...' : 'Optimizing code...'}
                  </span>
                </div>
              ) : generatedCode ? (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  <code>{generatedCode}</code>
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {activeTab === 'refactor' ? 'Refactored code' : 'Optimized code'} will appear
                    here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock functions for demonstration (replace with actual AI service calls)
async function mockCodeGeneration(request: CodeGenerationRequest): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

  if (request.type === 'component' && request.language === 'typescript') {
    return `import React, { useState, useEffect } from 'react';

interface ${request.description}Props {
  title: string;
  onAction?: () => void;
}

export const ${request.description}: React.FC<${request.description}Props> = ({
  title,
  onAction
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <button
        onClick={handleAction}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};

export default ${request.description};`;
  }

  return `// Generated ${request.type} in ${request.language}
// Description: ${request.description}
// Framework: ${request.framework || 'N/A'}

console.log('Hello, World!');
// TODO: Implement ${request.type} logic`;
}

async function mockCodeAnalysis(code: string): Promise<CodeAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

  return {
    complexity: 3,
    maintainability: 85,
    issues: [
      {
        type: 'warning',
        message: 'Consider using const instead of let for variables that are not reassigned',
        line: 5,
        suggestion: 'Replace let with const where appropriate',
      },
      {
        type: 'info',
        message: 'Function could benefit from early returns',
        line: 12,
        suggestion: 'Use early return pattern for better readability',
      },
    ],
    suggestions: [
      'Add TypeScript types for better type safety',
      'Consider extracting magic numbers into named constants',
      'Add error handling for edge cases',
      'Consider using async/await instead of promises for better readability',
    ],
  };
}

async function mockCodeRefactoring(code: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1800)); // Simulate API delay

  return `// Refactored Code - Improved structure and readability

interface UserData {
  id: string;
  name: string;
  email: string;
}

class UserService {
  private users: UserData[] = [];

  async createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
    const newUser: UserData = {
      id: this.generateId(),
      ...userData
    };

    this.users.push(newUser);
    return newUser;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  findUserById(id: string): UserData | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): UserData[] {
    return [...this.users];
  }
}

export const userService = new UserService();`;
}

async function mockCodeOptimization(code: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1600)); // Simulate API delay

  return `// Optimized Code - Performance improvements and best practices

import { memo, useMemo, useCallback } from 'react';

// Memoized component to prevent unnecessary re-renders
const OptimizedComponent = memo(({ data, onUpdate }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computedValue: item.value * 2 + item.multiplier
    }));
  }, [data]);

  // Memoize event handlers
  const handleUpdate = useCallback((id, newValue) => {
    onUpdate(id, newValue);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id, item.value)}>
          Optimized: {item.computedValue}
        </div>
      ))}
    </div>
  );
});

OptimizedComponent.displayName = 'OptimizedComponent';

export default OptimizedComponent;`;
}
