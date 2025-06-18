# Artist Gender Update Process

This document explains how to add gender information to artists with `bornElsewhere` data to display the correct Hebrew text ("נולד ב" for males, "נולדה ב" for females).

## Overview

The process involves three steps:
1. Update the Artist model to include a gender field
2. Add gender data to artists.json
3. Update the database with the gender information

## Files Created/Modified

### 1. Artist Model (`backend/artists/models/mongodb/Artist.js`)
- Added `gender` field with validation
- Gender is required when `bornElsewhere` is provided
- Accepts 'm' for male or 'f' for female

### 2. Gender Assignment Script (`backend/seed_data/add_gender_to_artists.js`)
- Interactive script to add gender data to artists.json
- Presents artists with `bornElsewhere` data one by one
- Accepts 'm', 'f', or 'skip' as input

### 3. Database Update Script (`backend/seed_data/update_artist_genders.js`)
- Updates the database with gender information from artists.json
- Follows the same pattern as `update_artist_images.js`

### 4. Frontend Update (`client/src/components/AreaPage.jsx`)
- Updated to use gender field for correct Hebrew text
- Falls back to "נולד/ה ב" if gender is not set

## Usage Instructions

### Step 1: Add Gender Data to artists.json

Run the interactive script to add gender information:

```bash
cd backend/seed_data
node add_gender_to_artists.js
```

The script will:
- Find all artists with `bornElsewhere` data
- Present each artist one by one
- Ask for gender input ('m' for male, 'f' for female, or 'skip' to skip)
- Update the artists.json file with the gender data

### Step 2: Update the Database

After adding gender data to artists.json, update the database:

```bash
cd backend/seed_data
node update_artist_genders.js
```

This script will:
- Connect to the database
- Read gender data from artists.json
- Update all matching artists in the database
- Show a summary of updates

### Step 3: Verify the Changes

The frontend will now display:
- "נולד ב[location]" for male artists
- "נולדה ב[location]" for female artists
- "נולד/ה ב[location]" as fallback if gender is not set

## Example Output

Before:
```
נולד/ה בצרפת
```

After (for female artist):
```
נולדה בצרפת
```

After (for male artist):
```
נולד בUSA
```

## Notes

- The gender field is only required for artists with `bornElsewhere` data
- Artists without `bornElsewhere` data don't need gender information
- The system gracefully falls back to the original text if gender is not set
- All scripts include error handling and detailed logging 