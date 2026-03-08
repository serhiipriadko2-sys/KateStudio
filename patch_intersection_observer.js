const fs = require('fs');
const file = 'k-sebe-yoga-studioWEB/__tests__/Landing.test.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace the buggy arrow function mock with a proper class-like mock
data = data.replace(
  /window\.IntersectionObserver = vi\.fn\(\)\.mockImplementation\(\(\) => \(\{\n  observe: \(\) => null,\n  unobserve: \(\) => null,\n  disconnect: \(\) => null,\n\}\)\);/,
  `// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});`
);

fs.writeFileSync(file, data);
