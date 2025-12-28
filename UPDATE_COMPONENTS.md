# 🔧 Update Components to Use Image Utility (Optional but Recommended)

## Why Update?

Currently, your components have hardcoded `http://localhost:8000` in image URLs. While the app will work in production (because we configured the environment variable in `api.js`), it's cleaner to update components to use the centralized `getImageUrl` utility.

## How to Update

### Example: Update any component with getImageUrl

**Before:**
```javascript
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/media/${path}`;
};
```

**After:**
```javascript
import { getImageUrl } from '../../utils/imageUtils';
// Remove the local getImageUrl function
```

## Components That Need Updating (Optional)

If you have time before deployment, update these files to import from `utils/imageUtils.js`:

1. `src/components/BasketDetailModal.jsx`
2. `src/components/BrowseSubscriptionBasketsPage.jsx`
3. `src/components/dashboard/BasketCard.jsx`
4. `src/components/dashboard/CartItem.jsx`
5. `src/components/dashboard/ClientBasketCard.jsx`
6. `src/components/dashboard/Header.jsx`
7. `src/components/dashboard/ProductCard.jsx`
8. `src/components/dashboard/ShopProductCard.jsx`
9. `src/components/dashboard/SubscriptionDetailModal.jsx`
10. `src/components/landing-page.jsx`
11. `src/components/products-page.jsx`
12. `src/components/stores-page.jsx`

## Quick Update Script

For each file, replace the local `getImageUrl` function with an import:

```javascript
// Add at the top
import { getImageUrl } from '../utils/imageUtils';  // Adjust path as needed

// Remove the local function
// const getImageUrl = (path) => { ... }
```

---

## ⚠️ Important Note

**This update is OPTIONAL for deployment.** Your app will work fine in production without these changes because `api.js` already uses environment variables.

This update just makes the code:
- **Cleaner** (single source of truth)
- **More maintainable** (easier to update URL logic)
- **More consistent** (all components use same utility)

---

## Skip This If You're in a Rush

If you need to deploy quickly for your academic deadline, you can skip this step entirely. The app will work perfectly in production as-is! ✅
