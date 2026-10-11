import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  authMessage,
  BUILD_TAG,
  authMode,
  canResetPassword,
  googleAvailable,
  resetPassword,
  signIn,
  signInWithGoogle,
  signUp,
} from '../auth/authService';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, IconButton, Segmented } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { Gender } from '../data/people';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

type Mode = 'signin' | 'signup';

export default function SignInScreen({ navigation, route }: RootScreenProps<'SignIn'>) {
  const { colors: c, beginSession } = useApp();
  const s = useStyles(makeStyles);

  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'signup');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const signup = mode === 'signup';
  const nameOk = name.trim().length >= 2;
  const emailOk = EMAIL.test(email.trim());
  const passwordOk = password.length >= MIN_PASSWORD;
  const genderOk = gender !== '';
  const valid = emailOk && passwordOk && (!signup || (nameOk && genderOk));

  const switchMode = (m: Mode) => {
    setMode(m);
    setTouched(false);
    setError('');
    setInfo('');
  };

  // Success: new learners go on to pick a goal, returning ones straight into the app.
  const done = (user: { name: string; email: string }, isNew: boolean) => {
    beginSession({ ...user, gender: isNew && gender ? gender : undefined }, isNew);
    if (isNew) navigation.navigate('Goals');
  };

  const run = async (job: () => Promise<{ name: string; email: string }>, isNew: boolean) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      done(await job(), isNew);
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    setTouched(true);
    if (!valid || busy) return;
    const mail = email.trim().toLowerCase();
    if (signup) run(() => signUp(name.trim().replace(/\s+/g, ' '), mail, password), true);
    else run(() => signIn(mail, password), false);
  };

  const forgot = async () => {
    setError('');
    setInfo('');
    if (!emailOk) {
      setTouched(true);
      setError('Enter your email above, then tap Forgot password.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setInfo('If that email has an account, a reset link is on its way.');
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />

      <View>
        <Txt v="h1">{signup ? 'Create your account' : 'Welcome back'}</Txt>
        <Txt v="body" color={c.muted} style={{ marginTop: 8 }}>
          {signup ? 'Save your progress and learn at your own pace.' : 'Sign in to pick up where you left off.'}
        </Txt>
      </View>

      <View style={{ gap: 14 }}>
        {signup ? (
          <Field label="Your name" error={touched && !nameOk ? 'Enter your name' : undefined}>
            <Ionicons name="person-outline" size={20} color={c.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Maya Rao"
              placeholderTextColor={c.muted}
              accessibilityLabel="Your name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              style={s.input}
            />
          </Field>
        ) : null}

        {signup ? (
          <View style={{ gap: 6 }}>
            <Txt v="bodyBold" style={{ fontSize: 14 }}>
              I am
            </Txt>
            <Segmented<Gender>
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              value={gender as Gender}
              onChange={setGender}
            />
            {touched && !genderOk ? (
              <Txt v="caption" color={c.dangerText}>
                Pick one so we can set your avatar
              </Txt>
            ) : null}
          </View>
        ) : null}

        <Field label="Email" error={touched && !emailOk ? 'Enter a valid email address' : undefined}>
          <Ionicons name="mail-outline" size={20} color={c.muted} />
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={c.muted}
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={s.input}
          />
        </Field>

        <Field
          label="Password"
          error={touched && !passwordOk ? `Use at least ${MIN_PASSWORD} characters` : undefined}
        >
          <Ionicons name="lock-closed-outline" size={20} color={c.muted} />
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder={signup ? `At least ${MIN_PASSWORD} characters` : 'Your password'}
            placeholderTextColor={c.muted}
            accessibilityLabel="Password"
            secureTextEntry={!showPw}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={signup ? 'new-password' : 'current-password'}
            textContentType={signup ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={submit}
            style={s.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
            onPress={() => setShowPw((v) => !v)}
            hitSlop={10}
          >
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.muted} />
          </Pressable>
        </Field>

        {!signup && canResetPassword ? (
          <Pressable accessibilityRole="button" onPress={forgot} disabled={busy} style={{ alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center' }}>
            <Txt v="bodyBold" color={c.primaryText} style={{ fontSize: 14 }}>
              Forgot password?
            </Txt>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={[s.notice, { backgroundColor: c.dangerSoft }]} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={18} color={c.dangerText} />
          <Txt v="small" color={c.dangerText} style={{ flex: 1 }}>
            {error}
          </Txt>
        </View>
      ) : null}
      {info ? (
        <View style={[s.notice, { backgroundColor: c.successSoft }]} accessibilityLiveRegion="polite">
          <Ionicons name="checkmark-circle" size={18} color={c.successText} />
          <Txt v="small" color={c.successText} style={{ flex: 1 }}>
            {info}
          </Txt>
        </View>
      ) : null}

      <Button label={busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} icon={busy ? undefined : 'arrow-forward'} onPress={submit} disabled={busy} />

      {googleAvailable ? (
        <>
          <View style={s.orRow}>
            <View style={s.rule} />
            <Txt v="caption">or</Txt>
            <View style={s.rule} />
          </View>
          <Button
            label="Continue with Google"
            variant="secondary"
            iconLeft="logo-google"
            disabled={busy}
            onPress={() => {
              setTouched(true);
              if (signup && !genderOk) return;
              run(signInWithGoogle, signup);
            }}
          />
        </>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, minHeight: 44 }}>
        <Txt v="small">{signup ? 'Already have an account?' : 'New to Devly?'}</Txt>
        <Pressable accessibilityRole="button" onPress={() => switchMode(signup ? 'signin' : 'signup')} hitSlop={8}>
          <Txt v="bodyBold" color={c.primaryText} style={{ fontSize: 14 }}>
            {signup ? 'Sign in' : 'Create account'}
          </Txt>
        </Pressable>
        {busy ? <ActivityIndicator size="small" color={c.primary} style={{ marginLeft: 8 }} /> : null}
      </View>

      {authMode === 'local' ? (
        <Txt v="caption" style={{ textAlign: 'center' }}>
          Accounts are stored on this device only.
        </Txt>
      ) : null}
      <Txt v="caption" style={{ textAlign: 'center', opacity: 0.6 }}>
        Build {BUILD_TAG} · {authMode}
      </Txt>
    </Screen>
  );
}

// Defined at module level so the inputs keep focus while typing.
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  return (
    <View style={{ gap: 6 }}>
      <Txt v="bodyBold" style={{ fontSize: 14 }}>
        {label}
      </Txt>
      <View style={[s.field, error ? { borderColor: c.danger } : null]}>{children}</View>
      {error ? (
        <Txt v="caption" color={c.dangerText}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 54,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      height: '100%',
      fontFamily: F.semi,
      fontSize: 15,
      color: c.text,
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
    },
    notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 12 },
    orRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rule: { flex: 1, height: 1, backgroundColor: c.border },
  });
