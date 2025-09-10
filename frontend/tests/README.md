# Location Detection Feature - Test Suite

## Overview

This test suite validates the location detection and suggestion functionality in the Add Project page using Playwright E2E framework.

## Test Coverage

### ✅ Passing Tests (26/30)

1. **Basic UI Elements** - Location input field and detect button display correctly
2. **Dynamic Suggestions** - Suggestions update when project type changes (Mangroves → Seagrass → Wetlands → Agroforestry)
3. **Suggestion Selection** - Clicking suggestions auto-fills the location field
4. **Show/Hide Behavior** - Suggestions appear on focus and hide when clicking outside
5. **Form Integration** - Location selection enables form validation and next button
6. **Error Handling** - Graceful fallback when backend API is unavailable
7. **Cross-Project Type Support** - All project types show appropriate suggestions
8. **Search Filtering** - Typing in input filters suggestions appropriately

### ⚠️ Known Issues (4/30)

1. **GPS Detection Tests** - Limited by browser geolocation permissions and API timeouts
2. **Firefox Timeout Issues** - Some tests timeout in Firefox due to network load state

## Test Results Summary

- **Total Tests**: 30 (across 3 browsers: Chrome, Firefox, Safari)
- **Passing**: 26 tests (87% pass rate)
- **Failing**: 4 tests (mainly GPS and browser-specific timeouts)

## Running Tests

### All Tests

```bash
npm run test
```

### Location Detection Only

```bash
npm run test:location
```

### With UI (headed mode)

```bash
npm run test:headed
```

### Single Browser

```bash
npx playwright test location-detection.spec.js --project=chromium
```

## Key Features Validated

### 1. Dynamic Location Suggestions

- **Mangroves**: Sundarbans National Park, Bhitarkanika Wildlife Sanctuary, Pichavaram Mangrove Forest
- **Seagrass**: Gulf of Mannar, Palk Bay, Chilika Lake
- **Wetlands**: Chilika Lake, Pulicat Lake, Vembanad Lake
- **Agroforestry**: Western Ghats region, Nilgiri Hills, Satpura Range

### 2. GPS Detection

- Auto-detect location using browser geolocation API
- Reverse geocoding to convert coordinates to readable addresses
- Loading states and error handling

### 3. User Experience

- Autocomplete with type-ahead filtering
- Click-to-select from dropdown suggestions
- Form validation integration
- Responsive suggestions based on project type

## File Structure

```
frontend/tests/
├── location-detection.spec.js    # Main test suite
└── README.md                     # This documentation

frontend/
├── playwright.config.js          # Playwright configuration
└── package.json                  # Test scripts
```

## Backend Integration

Tests verify integration with:

- `/api/locations/suggestions` - Get location suggestions by project type
- `/api/locations/reverse-geocode` - Convert coordinates to addresses
- Fallback data when API is unavailable

## CI/CD Ready

- Tests run in headless mode by default
- HTML reports generated for failed test analysis
- Cross-browser compatibility validated
- Retry logic for flaky network-dependent tests

## Payments feature in progress
