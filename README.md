# MotoLife Product Creation E2E Tests

Comprehensive Playwright E2E test suite for the MotoLife admin dashboard product creation form (https://motolife.rootdevs.xyz).

## Test Coverage

### product-form.spec.ts (20 Unit Tests)

Form validation and functionality tests:

| Test ID | Description |
|---------|-----------|
| 1.1 | Page loads successfully |
| 1.2 | SKU auto-generates from product name |
| 1.3 | Form validation for required fields |
| 2.1 | Price validation - selling price required |
| 2.2 | Price validation - buying price required |
| 2.3 | Price validation - selling > buying |
| 3.1 | Discount validation - percentage range |
| 3.2 | Discount validation - fixed amount |
| 4.1 | Benefit dropdown functionality |
| 4.2 | Multiple benefit selection |
| 5.1 | Size guide toggle |
| 5.2 | Size guide image upload |
| 5.3 | Size guide description |
| 6.1 | YouTube link validation - valid URL |
| 6.2 | YouTube link validation - invalid URL |
| 7.1 | Product variation toggle |
| 7.2 | Variation attribute selection |
| 8.1 | Product tags input |
| 8.2 | Multiple tags support |
| 9.1 | Cancel button functionality |

### product-e2e.spec.ts (18 E2E Tests)

End-to-end product creation flows:

| Test ID | Description |
|---------|-----------|
| 12.1 | Full valid form submission with success toast |
| 12.2 | Created product appears in product list |
| 12.3 | Create product with benefit |
| 12.4 | Create product without benefit |
| 12.5 | Create product with stock |
| 12.6 | Create product with zero stock |
| 12.7 | Create product with percentage discount |
| 12.8 | Product with benefit + stock + % discount |
| 12.9 | Product with benefit + stock + fixed discount |
| 12.10 | Product with benefit + stock + no discount |
| 12.11 | Product without benefit + stock + % discount |
| 12.12 | Product without benefit + stock + fixed discount |
| 12.13 | Product without benefit + stock + no discount |
| 12.14 | Product with benefit + zero stock + no discount |
| 12.15 | Product with benefit + zero stock + % discount |
| 12.16 | Product with benefit + zero stock + fixed discount |
| 12.17 | Product without benefit + zero stock + % discount |
| 12.18 | Product without benefit + zero stock + fixed discount |

### product-e2e-advanced.spec.ts (3 E2E Tests)

Advanced product scenarios with multiple features:

| Test ID | Description |
|---------|-----------|
| 13.1 | Product with benefit + size guide + 3 variations (Size, Gender, Color) + stock + percentage discount |
| 13.2 | Product without benefit + no size guide + zero stock + fixed discount |
| 13.3 | Product with YouTube link + 3 additional images + 3 variations + all features |

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test motolife_tests/product-form.spec.ts
npx playwright test motolife_tests/product-e2e.spec.ts
npx playwright test motolife_tests/product-e2e-advanced.spec.ts

# Run specific test
npx playwright test --grep "12.1"
```

## Prerequisites

- Node.js 18+
- Playwright installed (`npm install`)
- Test environment configured in `playwright.config.ts`
- Admin credentials configured in `motolife_tests/global.setup.ts`

## Project Structure

```
motolife_tests/
├── product-form.spec.ts          # Unit tests
├── product-e2e.spec.ts        # Basic E2E tests
├── product-e2e-advanced.spec.ts # Advanced E2E tests
├── global.setup.ts              # Authentication setup
├── navigation.helper.ts        # Navigation utilities
└── .auth/session.json        # Auth session storage
```

## Technologies

- **Playwright** - End-to-end testing framework
- **TypeScript** - Type-safe test development
- **MotoLife Admin Dashboard** - E-commerce admin panel

---

Built with Playwright for reliable browser automation.