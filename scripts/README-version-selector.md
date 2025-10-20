# EmulatorJS Version Selector

A sliding UI component that allows users to select between different game versions before starting, continuing, or creating a new game. This integrates with the Multi-Save State Manager to provide isolated save states for each version.

## Features

- 🎮 **3 Game Versions**: Pre-configured versions with different profiles
- 🎨 **Sliding UI**: Smooth slide-in animation from the right
- 🔄 **Seamless Integration**: Works with existing Start/Continue/New Game buttons
- 💾 **Profile Management**: Each version has its own save state profile
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ♿ **Accessibility**: Keyboard navigation and screen reader support

## How It Works

### Current Flow (Before)
1. User clicks "Start Game" → Game loads immediately
2. User clicks "Continue" → Game loads with save state
3. User clicks "New Game" → Game loads fresh

### New Flow (After)
1. User clicks "Start Game" → Version selector slides in
2. User selects a version → Game loads with that version's profile
3. User clicks "Continue" → Version selector slides in
4. User selects a version → Game loads with that version's save state
5. User clicks "New Game" → Version selector slides in
6. User selects a version → Game loads fresh with that version's profile

## Installation

1. **Include the CSS file**:
   ```html
   <link rel="stylesheet" href="/scripts/version-selector.css">
   ```

2. **Include the JavaScript file** (after auto-save-load.js):
   ```html
   <script src="/scripts/version-selector.js"></script>
   ```

3. **Ensure Multi-Save State Manager is loaded** (for profile management):
   ```html
   <link rel="stylesheet" href="/scripts/multi-save-state-manager.css">
   <script src="/scripts/multi-save-state-manager.js"></script>
   ```

## Configuration

### Default Versions

The selector comes with 3 pre-configured versions:

```javascript
const versions = [
    {
        id: 'version1',
        name: 'Version 1',
        description: 'Original game experience',
        profileName: 'version1'
    },
    {
        id: 'version2', 
        name: 'Version 2',
        description: 'Enhanced gameplay',
        profileName: 'version2'
    },
    {
        id: 'version3',
        name: 'Version 3', 
        description: 'Alternative story path',
        profileName: 'version3'
    }
];
```

### Customizing Versions

To customize the versions, modify the `versions` array in `/scripts/version-selector.js`:

```javascript
this.versions = [
    {
        id: 'my-version-1',
        name: 'My Custom Version',
        description: 'My custom description',
        profileName: 'my-version-1'
    },
    // ... more versions
];
```

## API Reference

### VersionSelector Class

#### Methods

##### `show(action)`
Shows the version selector with the specified action.

**Parameters:**
- `action` (string): The action being performed ('start', 'continue', 'new')

**Example:**
```javascript
window.EJS_VersionSelector.show('start');
```

##### `hide()`
Hides the version selector.

**Example:**
```javascript
window.EJS_VersionSelector.hide();
```

##### `getSelectedVersion()`
Returns the currently selected version object.

**Returns:** Version object or null

**Example:**
```javascript
const version = window.EJS_VersionSelector.getSelectedVersion();
if (version) {
    console.log('Selected:', version.name);
}
```

##### `getVersions()`
Returns an array of all available versions.

**Returns:** Array of version objects

**Example:**
```javascript
const versions = window.EJS_VersionSelector.getVersions();
console.log('Available versions:', versions);
```

### Events

The version selector triggers custom events that you can listen to:

```javascript
// Listen for version selection
document.addEventListener('version-selected', (event) => {
    console.log('Version selected:', event.detail.version);
    console.log('Action:', event.detail.action);
});
```

## Styling

### CSS Classes

- `.ejs_version_selector` - Main selector container
- `.ejs_version_selector.show` - Visible state
- `.ejs_version_button` - Version selection buttons
- `.ejs_version_button_close` - Close button
- `.ejs_version_selector_overlay` - Background overlay

### Customization

You can customize the appearance by overriding CSS variables or classes:

```css
.ejs_version_selector {
    /* Custom background */
    background: rgba(0, 0, 0, 0.98);
}

.ejs_version_button {
    /* Custom button styling */
    background-color: #your-color;
    border-radius: 20px;
}
```

## Integration with Multi-Save State Manager

The version selector automatically integrates with the Multi-Save State Manager:

1. **Profile Creation**: Version profiles are automatically created
2. **Profile Switching**: Selecting a version switches to that profile
3. **Save State Isolation**: Each version maintains its own save states
4. **Profile Management**: Versions can be managed through the Multi-Save UI

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- **Keyboard Navigation**: Tab through buttons, Enter to select, Escape to close
- **Focus Management**: Proper focus handling and restoration
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **High Contrast**: Works with high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Troubleshooting

### Common Issues

**Q: Version selector doesn't appear**
A: Make sure the script is loaded after the DOM is ready and check for JavaScript errors.

**Q: Versions don't save separately**
A: Ensure the Multi-Save State Manager is loaded and working properly.

**Q: Styling looks broken**
A: Make sure the CSS file is loaded and check for conflicting styles.

**Q: Mobile experience is poor**
A: The selector is responsive, but you may need to adjust the CSS for very small screens.

### Debug Mode

Enable debug logging by opening the browser console. The script logs important events:

```javascript
// Enable debug mode
localStorage.setItem('ejs-debug', 'true');
```

## Examples

### Basic Usage

```javascript
// Show selector for starting a new game
window.EJS_VersionSelector.show('start');

// Get currently selected version
const version = window.EJS_VersionSelector.getSelectedVersion();
if (version) {
    console.log(`Playing ${version.name}: ${version.description}`);
}
```

### Custom Integration

```javascript
// Listen for version selection
document.addEventListener('version-selected', (event) => {
    const { version, action } = event.detail;
    
    // Custom logic based on version
    switch(version.id) {
        case 'version1':
            // Load version 1 specific assets
            break;
        case 'version2':
            // Load version 2 specific assets
            break;
        case 'version3':
            // Load version 3 specific assets
            break;
    }
});
```

## File Structure

```
/scripts/
├── version-selector.css          # Styles for the selector UI
├── version-selector.js           # Main selector functionality
├── multi-save-state-manager.css  # Multi-save state styles
├── multi-save-state-manager.js   # Multi-save state functionality
└── auto-save-load/              # Original auto-save functionality
    ├── auto-save-load.css
    └── auto-save-load.js
```

## License

This project is open source and available under the MIT License.

---

**Note**: This version selector is designed to work seamlessly with EmulatorJS and enhances the existing game loading flow without modifying core EmulatorJS files.