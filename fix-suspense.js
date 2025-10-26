const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to add Suspense boundary to a file
function addSuspenseBoundary(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file already has Suspense import or has been modified
    if (content.includes('import { useState, useEffect, Suspense }') || 
        content.includes('function LoadingFallback()') ||
        content.includes('<Suspense fallback={<LoadingFallback />}>')) {
      console.log(`  - File already modified, skipping: ${filePath}`);
      return;
    }
    
    // Get the component name from the file path or default export
    const fileName = path.basename(filePath, '.tsx');
    const fileNameCamelCase = fileName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    // Extract the component name from 'export default function ComponentName'
    const componentNameMatch = content.match(/export default function ([A-Za-z0-9_]+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : `${fileNameCamelCase.charAt(0).toUpperCase() + fileNameCamelCase.slice(1)}Page`;
    
    // Derive content component name
    const contentComponentName = `${componentName.replace('Page', '')}Content`;
    
    // Add Suspense import
    content = content.replace(
      /import { useState, useEffect } from "react";/,
      'import { useState, useEffect, Suspense } from "react";'
    );
    
    // Add LoadingFallback component
    const loadingFallback = `
// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function ${contentComponentName}`;
    
    // Wrap the component with Suspense
    const defaultExport = `
// Main page component with Suspense
export default function ${componentName}() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <${contentComponentName} />
    </Suspense>
  );
}`;
    
    // Replace the original component declaration with the content component
    content = content.replace(
      /export default function ([A-Za-z0-9_]+)/,
      loadingFallback
    );
    
    // Add the new default export at the end
    content = content.replace(/}(\s*)$/, `}${defaultExport}`);
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  - Successfully modified: ${filePath}`);
    
  } catch (error) {
    console.error(`  - Error processing ${filePath}:`, error);
  }
}

// Find all files that need to be modified
const files = glob.sync('app/categories/**/*.tsx', {
  cwd: process.cwd(),
  ignore: ['app/categories/abayas/calligraphy/page.tsx', 'app/categories/abayas/formal/page.tsx'] // Skip already fixed files
});

console.log(`Found ${files.length} files to process.`);

// Process each file
files.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  
  // Read file content to check if it uses useSearchParams
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('useSearchParams()')) {
    addSuspenseBoundary(filePath);
  } else {
    console.log(`Skipping (no useSearchParams): ${filePath}`);
  }
});

console.log('Done!'); 