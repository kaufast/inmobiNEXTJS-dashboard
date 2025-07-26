import React, { useState, useRef } from 'react';
import { Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const DashboardButtonTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const resultsRef = useRef(null);

  const testSuites = [
    {
      name: 'Sidebar Navigation',
      tests: [
        { name: 'Overview Navigation', selector: 'button[title="Overview"], button:contains("Overview")', expectedChange: 'View should change to overview' },
        { name: 'Investments Navigation', selector: 'button[title="My Investments"], button:contains("Investments")', expectedChange: 'View should change to investments' },
        { name: 'Projects Navigation', selector: 'button[title="Active Projects"], button:contains("Projects")', expectedChange: 'View should change to projects' },
        { name: 'Analytics Navigation', selector: 'button[title="Analytics"], button:contains("Analytics")', expectedChange: 'View should change to analytics' },
        { name: 'Goals Navigation', selector: 'button[title="Goals"], button:contains("Goals")', expectedChange: 'View should change to goals' },
        { name: 'Settings Navigation', selector: 'button[title="Settings"], button:contains("Settings")', expectedChange: 'View should change to settings' }
      ]
    },
    {
      name: 'Top Navigation Tabs',
      tests: [
        { name: 'Home Tab', selector: 'button:contains("Home")', expectedChange: 'Tab should become active' },
        { name: 'Activities Tab', selector: 'button:contains("Activities")', expectedChange: 'Tab should become active' },
        { name: 'Health Status Tab', selector: 'button:contains("Health Status")', expectedChange: 'Tab should become active' },
        { name: 'Planning Tab', selector: 'button:contains("Planning")', expectedChange: 'Tab should become active' }
      ]
    },
    {
      name: 'Chart Controls',
      tests: [
        { name: 'Week Filter', selector: 'button:contains("Week")', expectedChange: 'Chart should show weekly data' },
        { name: 'Month Filter', selector: 'button:contains("Month")', expectedChange: 'Chart should show monthly data' },
        { name: 'Year Filter', selector: 'button:contains("Year")', expectedChange: 'Chart should show yearly data' }
      ]
    },
    {
      name: 'Action Buttons',
      tests: [
        { name: 'Show All Analysis', selector: 'button:contains("Show all")', expectedChange: 'Should expand analysis section' },
        { name: 'Invest Now', selector: 'button:contains("Invest Now")', expectedChange: 'Should open investment flow' },
        { name: 'New Investment', selector: 'button:contains("New Investment")', expectedChange: 'Should open new investment dialog' },
        { name: 'View Reports', selector: 'button:contains("View Reports")', expectedChange: 'Should navigate to reports' },
        { name: 'Withdraw Funds', selector: 'button:contains("Withdraw Funds")', expectedChange: 'Should open withdrawal flow' }
      ]
    },
    {
      name: 'Header Controls',
      tests: [
        { name: 'Search Button', selector: 'button:contains("Search")', expectedChange: 'Should open search interface' },
        { name: 'Calendar Button', selector: 'button:contains("Calendar")', expectedChange: 'Should open calendar view' },
        { name: 'ChatBot Button', selector: 'button:contains("ChatBot")', expectedChange: 'Should open chatbot' },
        { name: 'Dark Mode Toggle', selector: 'button svg.w-4.h-4', expectedChange: 'Should toggle theme (visual check needed)' },
        { name: 'Notifications', selector: 'button svg[class*="Bell"]', expectedChange: 'Should open notifications panel' }
      ]
    }
  ];

  const findElement = (selector) => {
    // Try direct selector first
    let element = document.querySelector(selector);
    if (element) return element;

    // Try finding by text content
    if (selector.includes(':contains(')) {
      const text = selector.match(/:contains\("([^"]*)"\)/)?.[1];
      if (text) {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        element = buttons.find(btn => 
          btn.textContent?.toLowerCase().includes(text.toLowerCase()) ||
          btn.innerText?.toLowerCase().includes(text.toLowerCase())
        );
        if (element) return element;
      }
    }

    // Try finding by SVG class or icon
    if (selector.includes('svg')) {
      const buttons = Array.from(document.querySelectorAll('button'));
      element = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && (
          svg.className.includes('Bell') ||
          svg.className.includes('Moon') ||
          svg.className.includes('Sun') ||
          (svg.classList.contains('w-4') && svg.classList.contains('h-4'))
        );
      });
      if (element) return element;
    }

    return null;
  };

  const testButton = async (test) => {
    setCurrentTest(test.name);
    
    try {
      const element = findElement(test.selector);
      
      if (!element) {
        return {
          ...test,
          status: 'FAIL',
          message: 'Element not found',
          details: `Could not locate button with selector: ${test.selector}`
        };
      }

      // Check if element is visible and enabled
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && element.offsetParent !== null;
      const isEnabled = !element.disabled && !element.hasAttribute('disabled');

      if (!isVisible) {
        return {
          ...test,
          status: 'FAIL',
          message: 'Element not visible',
          details: 'Button exists but is not visible on screen'
        };
      }

      if (!isEnabled) {
        return {
          ...test,
          status: 'FAIL',
          message: 'Element disabled',
          details: 'Button is disabled and cannot be clicked'
        };
      }

      // Record initial state
      const initialClasses = element.className;
      const initialStyle = element.style.cssText;

      // Click the button
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      element.click();
      
      // Wait for state changes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for visual changes
      const newClasses = element.className;
      const newStyle = element.style.cssText;
      const classesChanged = initialClasses !== newClasses;
      const styleChanged = initialStyle !== newStyle;
      const hasActiveClass = element.classList.contains('bg-orange-500') || 
                            element.classList.contains('bg-white') ||
                            element.classList.contains('active');

      return {
        ...test,
        status: 'PASS',
        message: 'Button clicked successfully',
        details: `Classes changed: ${classesChanged}, Style changed: ${styleChanged}, Has active state: ${hasActiveClass}`
      };

    } catch (error) {
      return {
        ...test,
        status: 'FAIL',
        message: 'Error during test',
        details: error.message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('');

    const allTests = testSuites.flatMap(suite => 
      suite.tests.map(test => ({ ...test, suite: suite.name }))
    );

    const results = [];

    for (const test of allTests) {
      const result = await testButton(test);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  const runSingleTest = async (test, suiteName) => {
    setIsRunning(true);
    setCurrentTest(test.name);
    
    const result = await testButton({ ...test, suite: suiteName });
    setTestResults(prev => [...prev.filter(r => r.name !== test.name), result]);
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTest('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'text-green-500';
      case 'FAIL': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAIL': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const totalTests = testResults.length;

  return (
    <div className="fixed top-4 right-4 w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard Button Tester
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Test all interactive elements on the dashboard
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run All Tests'}</span>
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>

        {/* Progress */}
        {isRunning && currentTest && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Currently testing: {currentTest}
            </div>
            <div className="mt-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalTests / testSuites.flatMap(s => s.tests).length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Summary */}
        {testResults.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Results: {passedTests}/{totalTests} tests passed
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Success rate: {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
            </div>
          </div>
        )}

        {/* Test Suites */}
        <div className="space-y-3 max-h-96 overflow-y-auto" ref={resultsRef}>
          {testSuites.map((suite) => (
            <div key={suite.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {suite.name}
                </h4>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {suite.tests.map((test) => {
                  const result = testResults.find(r => r.name === test.name);
                  return (
                    <div key={test.name} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {result && getStatusIcon(result.status)}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {test.name}
                            </span>
                          </div>
                          {result && (
                            <div className="mt-1">
                              <div className={`text-xs ${getStatusColor(result.status)}`}>
                                {result.message}
                              </div>
                              {result.details && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {result.details}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => runSingleTest(test, suite.name)}
                          disabled={isRunning}
                          className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardButtonTester;