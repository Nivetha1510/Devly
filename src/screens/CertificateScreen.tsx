import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import CertificateCard from '../components/CertificateCard';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, IconButton } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { getCourse } from '../data/courses';
import { hasPassedMaster, NAME_MAX, validateName } from '../data/practice';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';
import { downloadCertificate } from '../utils/certificateFile';

// Issues a certificate (after confirming the name) and shows/downloads it.
export default function CertificateScreen({ navigation, route }: RootScreenProps<'Certificate'>) {
  const { colors: c, prefs, issueCertificateFor } = useApp();
  const s = useStyles(makeStyles);
  const course = getCourse(route.params.courseId);

  const cert = prefs.certificates.find((x) => x.course_id === course.id);
  const passed = hasPassedMaster(prefs.attempts, course.id);

  const [name, setName] = useState(prefs.name);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const check = validateName(name);

  const issue = () => {
    setTouched(true);
    if (!check.ok) return;
    if (!issueCertificateFor(course.id, course.title, check.value)) {
      Alert.alert('Not available yet', 'Pass the Master Quiz first.');
    }
  };

  const download = async () => {
    if (!cert) return;
    setBusy(true);
    try {
      await downloadCertificate(cert);
    } catch (e) {
      Alert.alert('Could not create the PDF', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const back = <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />;

  // Not earned yet.
  if (!cert && !passed) {
    return (
      <Screen>
        {back}
        <Txt v="h2">No certificate yet</Txt>
        <Txt v="body" color={c.muted}>
          Pass the {course.title} Master Quiz to earn your certificate.
        </Txt>
        <Button
          label="Go to the Master Quiz"
          icon="arrow-forward"
          onPress={() => navigation.replace('PracticeLanguage', { courseId: course.id })}
        />
      </Screen>
    );
  }

  // Passed, certificate not issued yet: confirm the name that will be printed.
  if (!cert) {
    return (
      <Screen footer={<Button label="Issue my certificate" icon="ribbon" onPress={issue} style={{ flex: 1 }} />}>
        {back}
        <View>
          <Txt v="h1">Congratulations!</Txt>
          <Txt v="body" color={c.muted} style={{ marginTop: 8 }}>
            You passed the {course.title} Master Quiz. Check the name below, then get your certificate.
          </Txt>
        </View>
        <View style={{ gap: 6 }}>
          <Txt v="bodyBold" style={{ fontSize: 14 }}>
            Name on certificate
          </Txt>
          <View style={[s.field, touched && !check.ok ? { borderColor: c.danger } : null]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={c.muted}
              accessibilityLabel="Name on certificate"
              autoCapitalize="words"
              autoComplete="name"
              maxLength={NAME_MAX + 20}
              returnKeyType="done"
              onSubmitEditing={issue}
              style={s.input}
            />
          </View>
          {touched && !check.ok ? (
            <Txt v="caption" color={c.dangerText}>
              {check.error}
            </Txt>
          ) : (
            <Txt v="caption">This name will be printed on your certificate.</Txt>
          )}
        </View>
      </Screen>
    );
  }

  // Issued.
  return (
    <Screen
      footer={
        <Button
          label={busy ? 'Preparing PDF…' : 'Download PDF'}
          iconLeft="download-outline"
          disabled={busy}
          onPress={download}
          style={{ flex: 1 }}
        />
      }
    >
      {back}
      <View>
        <Txt v="h2">Your certificate</Txt>
        <Txt v="small">{cert.course_title}</Txt>
      </View>
      <CertificateCard cert={cert} />
      <Txt v="caption" style={{ textAlign: 'center' }}>
        Issued by the Devly app on this device.
      </Txt>
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    field: { height: 54, borderRadius: 18, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface, paddingHorizontal: 16, justifyContent: 'center' },
    input: { height: '100%', fontFamily: F.semi, fontSize: 16, color: c.text },
  });
