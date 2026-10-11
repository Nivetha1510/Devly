# Devly — notes for Claude Code

Expo SDK 57, React Native 0.86, TypeScript (strict). Created from `create-expo-app --template blank-typescript`.

## Rules for this project

- Navigation is **React Navigation 7** (`src/navigation/`), NOT Expo Router. Do not add `expo-router` or an `app/` folder.
- Add packages with `npx expo install <pkg>` so versions match the SDK.
- Colours: never hard-code UI colours in screens. Use `useApp().colors` / `useColors()` and build styles with
  `const s = useStyles(makeStyles)` where `makeStyles = (c: Colors) => StyleSheet.create({...})` is defined outside the component.
- Text: use `<Txt v="h1|h2|h3|body|bodyBold|small|caption|eyebrow">` from `src/components/Txt.tsx`.
- Shared UI (Button, IconButton, Chip, Segmented, Card, Pill, ProgressBar, Ring, FadeIn, ThemeToggle) lives in `src/components/ui.tsx`.
- Screens wrap content in `<Screen>` (`inTabs` for tab screens, `footer={...}` for a sticky bottom button).
- Saved user preferences live in `src/context/AppContext.tsx` (`prefs`, `update()`), persisted with AsyncStorage.
- Onboarding vs main app is switched by `prefs.onboarded` in `RootNavigator` (no manual reset needed).
- Touch targets at least 44px; give icon-only buttons an `accessibilityLabel`.

## Checks before finishing a change

```bash
npx tsc --noEmit
npx expo export -p web --output-dir dist   # confirms the bundle builds
```
