# Elite Estates - Premium Real Estate Platform

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Supabase
- **Styling**: Premium Vanilla CSS/StyleSheet
- **Icons**: Lucide-React-Native
- **Animations**: React Native Reanimated

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Supabase**:
   - Create a new project on [Supabase](https://supabase.com).
   - Run the SQL script found in `supabase/schema.sql` in the Supabase SQL Editor.
   - Copy your `Project URL` and `Anon Key`.

3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the App**:
   ```bash
   npx expo start
   ```

## Folder Structure
- `src/lib/supabase.ts`: Supabase client configuration.
- `src/styles/theme.ts`: Design system tokens (Colors, Spacing, etc.).
- `src/screens/HomeScreen.tsx`: Main discovery engine UI.
- `App.tsx`: Navigation and root configuration.
