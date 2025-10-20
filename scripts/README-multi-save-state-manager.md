# EmulatorJS Multi-Save State Manager

A powerful extension for EmulatorJS that enables multiple save state profiles, allowing users to create, switch between, and manage different save state collections.

## Features

- 🎮 **Multiple Save State Profiles**: Create unlimited save state profiles
- 🔄 **Seamless Switching**: Switch between profiles without losing data
- 💾 **Profile Management**: Create, delete, and manage profiles easily
- 📤 **Export/Import**: Export and import profile data as JSON
- 🎨 **Intuitive UI**: Clean, responsive interface for profile management
- 🔒 **Data Isolation**: Each profile maintains its own save states
- ⚡ **Performance**: Efficient storage using IndexedDB
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Installation

1. **Download the files**:
   - `multi-save-state-manager.js` - Main script
   - `multi-save-state-manager.css` - Styling (optional but recommended)

2. **Include in your HTML**:
   ```html
   <!-- Include after EmulatorJS -->
   <link rel="stylesheet" href="/scripts/multi-save-state-manager.css">
   <script src="/scripts/multi-save-state-manager.js"></script>
   ```

3. **That's it!** The script will automatically initialize and add the UI controls.

## Usage

### Basic Usage

Once loaded, you'll see a floating UI panel in the top-right corner of your page with:

- **Profile Selector**: Dropdown to switch between profiles
- **New Profile**: Input field and button to create new profiles
- **Delete Profile**: Button to delete the selected profile
- **Export/Import**: Buttons to export and import profile data

### Programmatic Usage

```javascript
// Access the manager instance
const manager = window.EJS_MultiSaveStateManager;

// Create a new profile
await manager.createProfile('my-adventure');

// Switch to a profile
await manager.switchProfile('my-adventure');

// Get current profile
const currentProfile = manager.getCurrentProfile();

// Get all available profiles
const profiles = manager.getProfiles();

// Export profile data
const exportData = await manager.exportProfile('my-adventure');

// Import profile data
await manager.importProfile('my-adventure', importData);

// Delete a profile (cannot delete 'default')
await manager.deleteProfile('my-adventure');
```

### Event Listening

```javascript
// Listen for profile changes
window.addEventListener('ejs-profile-changed', (event) => {
    console.log('Profile changed to:', event.detail.profile);
    // Update your UI or perform other actions
});
```

## API Reference

### Methods

#### `createProfile(profileName: string): Promise<string>`
Creates a new save state profile.

**Parameters:**
- `profileName` - Name for the new profile (must be unique)

**Returns:** Promise that resolves to the profile name

**Throws:** Error if profile name is empty or already exists

#### `switchProfile(profileName: string): Promise<void>`
Switches to a different save state profile.

**Parameters:**
- `profileName` - Name of the profile to switch to

**Throws:** Error if profile doesn't exist

#### `deleteProfile(profileName: string): Promise<void>`
Deletes a save state profile and all its data.

**Parameters:**
- `profileName` - Name of the profile to delete

**Throws:** Error if profile doesn't exist or is the default profile

#### `getProfiles(): string[]`
Returns an array of all available profile names.

**Returns:** Array of profile names

#### `getCurrentProfile(): string`
Returns the name of the currently active profile.

**Returns:** Current profile name

#### `exportProfile(profileName: string): Promise<object>`
Exports all save state data for a specific profile.

**Parameters:**
- `profileName` - Name of the profile to export

**Returns:** Promise that resolves to an object containing:
- `profileName` - Name of the exported profile
- `timestamp` - Export timestamp
- `data` - Object containing all save state data

#### `importProfile(profileName: string, importData: object): Promise<void>`
Imports save state data into a profile.

**Parameters:**
- `profileName` - Name of the profile to import into
- `importData` - Data object from exportProfile()

## How It Works

### Storage Architecture

The script enhances EmulatorJS's existing storage system without modifying core files:

1. **Database**: Uses the same "EmulatorJS-states" IndexedDB database
2. **Key Prefixing**: Profile keys are prefixed as `{profileName}:{originalKey}`
3. **Storage Wrapper**: Wraps the original `storage.states` object to add profile functionality
4. **Metadata**: Profile information is stored in localStorage

### Key Format Examples

- Original key: `game.state`
- Profile "adventure": `adventure:game.state`
- Profile "speedrun": `speedrun:game.state`

### Data Flow

1. **Save State**: `emulator.storage.states.put(key, data)` → `{profile}:{key}`
2. **Load State**: `emulator.storage.states.get(key)` → `{profile}:{key}`
3. **Profile Switch**: Updates the active profile prefix
4. **Data Isolation**: Each profile only sees its own save states

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Requirements

- EmulatorJS 4.0.9+
- Modern browser with IndexedDB support
- No additional dependencies

## Troubleshooting

### Common Issues

**Q: UI panel doesn't appear**
A: Make sure the script is loaded after EmulatorJS and check the browser console for errors.

**Q: Can't create profiles**
A: Ensure profile names are unique and not empty. Check for JavaScript errors in the console.

**Q: Save states not switching between profiles**
A: The script may not have properly enhanced the storage. Try refreshing the page.

**Q: Export/import not working**
A: Check that the browser allows file downloads and that the JSON file is valid.

### Debug Mode

Enable debug logging by opening the browser console. The script logs important events and errors.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source and available under the MIT License.

## Changelog

### Version 1.0.0
- Initial release
- Multiple save state profiles
- Profile management UI
- Export/import functionality
- Event system for profile changes

## Support

For issues, questions, or feature requests, please open an issue on the project repository.

---

**Note**: This script is designed to work with EmulatorJS and enhances its existing functionality. It does not modify core EmulatorJS files and can be safely added to existing implementations.