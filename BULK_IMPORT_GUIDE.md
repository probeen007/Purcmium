# Bulk Product Import System - User Guide

## Overview

The Bulk Product Import system allows you to import hundreds of products at once using CSV files. It features:

- **Two-phase import process**: Preview → Execute
- **Smart category resolution**: Auto-matches existing categories, prompts for new ones
- **Comprehensive validation**: Field validation, duplicate detection, price validation
- **Transaction safety**: All-or-nothing import with automatic rollback on errors
- **Detailed feedback**: Row-by-row validation status and error reporting

---

## How to Use

### Step 1: Download CSV Template

1. Navigate to **Admin Panel** → **Bulk Import**
2. Click **"Download CSV Template"** button
3. Open the downloaded `product-import-template.csv` file

### Step 2: Fill CSV File

The CSV file has the following columns:

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| **title** | ✅ Yes | Text (max 200 chars) | `"Sony PlayStation 5 Console"` |
| **categories** | ✅ Yes | Comma-separated | `"Gaming,Electronics"` |
| **shortDescription** | ✅ Yes | Text (max 300 chars) | `"Next-gen gaming console"` |
| **description** | ✅ Yes | Text (max 5000 chars) | `"Full product description..."` |
| **images** | ✅ Yes | Pipe-separated URLs | `"url1.jpg\|url2.jpg\|url3.jpg"` |
| **affiliateLinks** | ✅ Yes | JSON array | See below |
| **tags** | ❌ No | Comma-separated | `"gaming,ps5,console"` |
| **topSelling** | ❌ No | Boolean | `true` or `false` |

#### Affiliate Links Format (JSON Array)

```json
[
  {
    "network": "Amazon India",
    "url": "https://amzn.to/xyz123",
    "price": 49999,
    "label": "Buy on Amazon",
    "isPrimary": true
  },
  {
    "network": "Flipkart",
    "url": "https://fkrt.in/abc456",
    "price": 48999,
    "label": "Buy on Flipkart",
    "isPrimary": false
  }
]
```

**Important Rules:**
- Price is in **paisa/cents** (₹499.99 = 49999)
- **Exactly one** affiliate link must have `"isPrimary": true`
- At least one affiliate link is required

#### Example CSV Row

```csv
title,categories,shortDescription,description,images,affiliateLinks,tags,topSelling
"Sony PlayStation 5","Gaming,Electronics","Next-gen gaming console","Experience lightning-fast loading with an ultra-high speed SSD...","https://cdn.example.com/ps5-1.jpg|https://cdn.example.com/ps5-2.jpg","[{""network"":""Amazon India"",""url"":""https://amzn.to/xyz"",""price"":49999,""isPrimary"":true}]","gaming,ps5,sony",true
```

### Step 3: Upload and Preview

1. Click **"Choose CSV file"** or drag-drop your CSV
2. Click **"Preview Import"**
3. System will:
   - Parse and validate all products
   - Check categories against database
   - Detect duplicate products
   - Validate affiliate links and prices

### Step 4: Resolve New Categories

If your CSV contains categories that don't exist in the database:

1. You'll see a **"New Categories Detected"** section
2. For each new category, provide:
   - **Image URL** (required): SVG/PNG icon with transparent background
   - **Description** (optional): Brief category description (max 200 chars)
   - **Display Order** (optional): Number for sorting (default: 0)

**Example:**
```
Category Name: Gaming Consoles (locked, from CSV)
Image URL: https://cdn.example.com/icons/gaming-console.svg
Description: Gaming consoles and accessories from top brands
Display Order: 10
```

### Step 5: Review Preview Table

The preview table shows:

- **Row Number**: Original CSV row
- **Title**: Product name
- **Categories**: 
  - 🟢 Green badge = Existing category (auto-resolved)
  - 🟡 Yellow badge = New category (needs creation)
- **Price**: Auto-calculated from affiliate links (lowest price)
- **Status**:
  - ✅ **Valid**: Ready to import
  - ❌ **Invalid**: Has errors, won't be imported
  - ⚠️ **Warnings**: Will import but review recommended

### Step 6: Execute Import

1. Ensure all new categories have required images
2. Review validation warnings if any
3. Click **"Import X Products"** button
4. System will:
   - Create new categories with provided data
   - Import all valid products
   - Link products to categories
   - Update category product counts
   - Skip invalid products

### Step 7: View Results

Import results show:

- **Products Created**: Successfully imported
- **Categories Created**: New categories added
- **Products Skipped**: Invalid products (with error details)
- **Errors**: Row-by-row error messages for debugging

---

## Validation Rules

### Product Title
- Required, max 200 characters
- Must be unique per primary affiliate URL

### Categories
- At least one category required
- Normalized to lowercase slugs (e.g., "Gaming Consoles" → "gaming-consoles")
- Must exist in database OR be created during import

### Short Description
- Required, max 300 characters

### Description
- Required, max 5000 characters

### Images
- At least one image URL required
- Pipe-separated for multiple images
- Must be valid URLs

### Affiliate Links
- Must be valid JSON array
- At least one link required
- **Exactly one** link must have `isPrimary: true`
- Each link requires: `network`, `url`, `price`, `label`
- Prices must be positive integers (in paisa/cents)

### Tags
- Optional, comma-separated
- Each tag max 30 characters

### Top Selling
- Optional, accepts: `true`, `false`, `1`, `0`, `yes`, `no`

---

## Duplicate Detection

The system detects duplicates using:
- **Product Title** (case-insensitive)
- **Primary Affiliate URL**

If a match is found:
- ⚠️ Warning shown in preview
- Product will be **skipped** during import (not overwritten)

---

## Price Validation

The system:
1. Auto-calculates product price as **minimum** of all affiliate link prices
2. Warns if price variance > 20% between affiliate links
3. Example:
   - Amazon: ₹49,999
   - Flipkart: ₹48,999
   - **Product Price**: ₹48,999 (lowest)
   - Variance: 2% (no warning)

---

## Category Resolution Logic

### For Each Category in CSV:

1. **Normalize**: "Gaming Consoles" → "gaming-consoles" (slug)
2. **Check Database**: Query `Category` collection by slug
3. **Result**:
   - 🟢 **Found**: Auto-resolve, use existing category
   - 🟡 **Not Found**: Mark as "new", require user to create

### Creating New Categories:

1. User provides: Image URL (required), Description, Order
2. System generates slug automatically from name
3. Category created **before** importing products
4. Prevents orphaned products without valid categories

---

## Transaction Safety

The import process uses **MongoDB transactions** to ensure:

1. **All-or-nothing**: Categories + Products committed together
2. **Automatic rollback** on errors
3. **Race condition handling**: Re-fetches categories after creation
4. **Batch processing**: Products imported in batches of 50

If the import fails:
- No partial data is saved
- Database remains in original state
- Error details provided for debugging

---

## CSV Format Tips

### Use Double Quotes for JSON in CSV

```csv
affiliateLinks
"[{""network"":""Amazon"",""url"":""https://..."",""price"":49999,""isPrimary"":true}]"
```

### Escape Special Characters

- Commas in text: Use quotes `"Product Name, 2024 Edition"`
- Quotes in text: Double them `"He said ""Hello"""`

### Multi-line Descriptions

```csv
description
"This is a long description
with multiple lines
wrapped in quotes"
```

### Multiple Images

```csv
images
"https://cdn.example.com/img1.jpg|https://cdn.example.com/img2.jpg|https://cdn.example.com/img3.jpg"
```

---

## Common Errors & Solutions

### Error: "Affiliate links must be a valid JSON array"

**Cause**: Invalid JSON format in affiliateLinks column

**Solution**: 
1. Use JSON validator (jsonlint.com)
2. Ensure double quotes around keys and values
3. Escape quotes in CSV: `""` instead of `"`

Example:
```csv
"[{""network"":""Amazon"",""url"":""https://..."",""price"":49999,""isPrimary"":true}]"
```

### Error: "Exactly one affiliate link must be primary"

**Cause**: Zero or multiple links have `isPrimary: true`

**Solution**: Set exactly ONE link with `"isPrimary": true`

### Error: "Invalid affiliate link price"

**Cause**: Price is not a positive integer or missing

**Solution**: 
- Use integers (no decimals)
- Price in paisa: ₹499.99 → `49999`
- Must be > 0

### Warning: "Duplicate product detected"

**Cause**: Product with same title + primary URL already exists

**Solution**: 
- Product will be skipped (not imported)
- Review existing product or change title/URL

### Warning: "Price variance between affiliate links exceeds 20%"

**Cause**: Large price difference between links (might be error)

**Solution**:
- Review prices for accuracy
- Product will still import (just a warning)

---

## Best Practices

### 1. Start Small
- Test with 5-10 products first
- Verify results before bulk import

### 2. Prepare Categories
- Create main categories via UI first
- Reduces new category creation during import

### 3. Validate CSV
- Use spreadsheet software (Excel, Google Sheets)
- Check for empty cells in required columns
- Validate JSON in affiliateLinks column

### 4. Image URLs
- Use CDN for faster loading
- Prefer HTTPS URLs
- Test URLs before import (should be publicly accessible)

### 5. Affiliate Links
- Include at least 2-3 networks for comparison
- Set primary link to most reliable network
- Use short/trackable URLs (bit.ly, amzn.to)

### 6. Price Consistency
- Double-check prices before import
- Use current market prices
- Update regularly (re-import with updated CSV)

---

## Performance Notes

- **Maximum file size**: 10MB CSV
- **Recommended batch**: 100-500 products per import
- **Large imports**: Split into multiple CSV files
- **Processing time**: ~2-5 seconds per 100 products

---

## API Endpoints (For Developers)

### GET `/api/admin/import/template`
Downloads CSV template with examples

**Response**: CSV file (multipart/form-data)

---

### POST `/api/admin/import/preview`
Parses and validates CSV, resolves categories

**Request**:
```javascript
FormData {
  csvFile: File (CSV)
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalRows": 100,
    "validRows": 95,
    "invalidRows": 5,
    "products": [
      {
        "rowNumber": 1,
        "title": "Product Name",
        "categories": [
          {"slug": "electronics", "originalName": "Electronics", "exists": true}
        ],
        "calculatedPrice": 49999,
        "isValid": true,
        "errors": [],
        "warnings": ["Duplicate product detected"]
      }
    ],
    "categoryResolution": {
      "existing": [{"name": "Electronics", "slug": "electronics"}],
      "newCategories": [
        {"slug": "gaming-consoles", "originalName": "Gaming Consoles", "needsCreation": true}
      ],
      "totalNew": 1
    },
    "requiresAction": true
  }
}
```

---

### POST `/api/admin/import/execute`
Executes import with category creation

**Request**:
```json
{
  "products": [
    {
      "title": "Product Name",
      "categories": [{"slug": "electronics"}],
      "shortDescription": "...",
      "description": "...",
      "images": ["url1", "url2"],
      "affiliateLinks": [...],
      "tags": ["tag1"],
      "topSelling": true,
      "isValid": true
    }
  ],
  "newCategories": [
    {
      "slug": "gaming-consoles",
      "name": "Gaming Consoles",
      "image": "https://...",
      "description": "Gaming consoles and accessories",
      "order": 10
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "categoriesCreated": 1,
    "productsCreated": 95,
    "productsSkipped": 5,
    "errors": [
      {
        "row": 3,
        "title": "Product Name",
        "error": "No valid categories found"
      }
    ]
  }
}
```

---

## Troubleshooting

### Import stuck on "Processing..."

1. Check browser console for errors
2. Verify CSV file size < 10MB
3. Check server logs for backend errors
4. Try smaller batch (split CSV)

### Categories not auto-resolving

1. Verify category exists in database (Admin → Categories)
2. Check exact spelling (case-insensitive)
3. System normalizes: "Gaming Consoles" = "gaming-consoles" = "Gaming consoles"

### Products imported but not visible

1. Check category filters on Products page
2. Verify products have `isActive: true` (set in CSV or via UI)
3. Check category has products (category.productCount > 0)

### Transaction failed

1. Check MongoDB connection
2. Verify user has write permissions
3. Review server logs for specific error
4. Try smaller batch (reduce concurrent writes)

---

## Support

For issues or questions:
1. Check validation errors in preview table
2. Review this guide for common solutions
3. Contact admin support with:
   - CSV file sample (first 5 rows)
   - Screenshots of errors
   - Browser console logs (if UI issue)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
