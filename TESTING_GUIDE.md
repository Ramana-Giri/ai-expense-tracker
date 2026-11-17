# Stage 2 Testing Guide

## What's Ready to Test

### ✅ Goals Page
**URL**: `/goals`

**Features to Test:**
1. **Create Goal**
   - Click "New Goal" button
   - Fill in: Goal Name, Target Amount, Description (optional)
   - Set status (default: Active)
   - Add Current Savings amount
   - Add Monthly Contribution (optional)
   - Set Target Date (optional)
   - Click "Save Goal"
   - Should appear in goals list

2. **View Goals**
   - Goals display in 3-column responsive grid
   - Shows progress bar
   - Displays saved vs target amount
   - Shows remaining amount
   - Shows status badge (color-coded)

3. **Filter Goals**
   - Click status filter buttons: All, Active, Completed, Paused, Cancelled
   - List updates to show only matching goals

4. **Edit Goal**
   - Click pencil icon on goal card
   - Modal opens with current data
   - Edit any field
   - Click "Save Goal"
   - Changes reflected in list

5. **Delete Goal**
   - Click trash icon on goal card
   - Confirmation dialog appears
   - Click "Yes, delete" to confirm
   - Goal removed from list

**Expected Behaviors:**
- Progress bar fills based on current_savings / target ratio
- Color indicators: Red (0-25%), Yellow (25-50%), Blue (50-75%), Green (75-100%)
- Empty state shown when no goals
- Loading state shown when fetching

---

### ✅ Settings Page
**URL**: `/settings`

**Features to Test:**

1. **AI Configuration Tab**
   - Form loads with empty/default values
   - Fields visible:
     - Provider dropdown (OpenAI, Anthropic, Google)
     - Model dropdown (updates based on provider)
     - API Key input with eye icon to toggle visibility
     - Temperature slider (0-2)
     - Max Tokens input

2. **Change Provider**
   - Select different provider
   - Model dropdown updates with provider-specific options
   - OpenAI: gpt-4, gpt-4-turbo, gpt-3.5-turbo
   - Anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku
   - Google: gemini-pro, gemini-pro-vision

3. **API Configuration**
   - Enter API key (text visible when eye icon clicked)
   - Adjust temperature slider
   - Set max tokens
   - Click "Save Settings"
   - Success message appears (green)
   - Settings persist

4. **Test Connection**
   - Click "Test Connection"
   - Connection verification happens
   - Success/error message shown

5. **Validation**
   - Try save without API key → shows error
   - Temperature outside 0-2 → shows error
   - Max tokens < 100 → shows error

**Expected Behaviors:**
- Save button disabled if no changes made
- Success message auto-dismisses after 3 seconds
- Error messages stay until issue resolved
- API key appears as dots/asterisks (password field)

---

## Current Limitations (By Design)

### API Integration Status
The following operations log to console but don't call real API yet:
- Creating goals
- Updating goals
- Saving AI settings
- Testing connection

**Why?** Console.log placeholders are there for easy integration when backend is ready.

### To Enable Live API Integration
See `STAGE2_IMPLEMENTATION.md` for code changes needed.

---

## Integration with Other Pages

### Dashboard
- Should show goals summary (when linked)
- Progress bars for each goal
- Total goals count

### Transactions
- No direct integration yet
- Will link to goals in Stage 3

### Budgets
- Separate but related
- Both track spending limits/goals
- Could show together in dashboard

---

## Browser Console
Watch for any errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Create/edit/delete goals
4. Should see console.log entries like:
   ```
   Creating goal: {name: "Emergency Fund", target_amount_paise: 500000, ...}
   ```

---

## Responsive Design
Test on different screen sizes:
- **Desktop**: 3-column grid for goals
- **Tablet**: 2-column grid for goals
- **Mobile**: 1-column grid for goals

---

## Performance
- Goals page loads data on mount
- Settings page loads AI settings on mount
- Filtering is instant (client-side)
- Status changes immediately

---

## Known Status: Console Logs (Not Errors!)
These are intentional placeholders:
```
Creating goal: {...}
Updating goal: {...}
Deleting goal: {...}
Saving AI settings: {...}
Testing connection...
```

No actual API calls are made yet. This is ready for backend integration.

---

## Next Actions
1. ✅ Test UI/UX on all pages
2. ⏳ Enable API integration (replace console.log)
3. ⏳ Test with real backend data
4. ⏳ Test filters and pagination
5. ⏳ Create Stage 3 features
