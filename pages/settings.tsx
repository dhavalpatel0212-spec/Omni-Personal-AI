import React from 'react';
import { SettingsLayout } from '../components/SettingsLayout';
import { ProfileSettings } from '../components/ProfileSettings';

const SettingsPage = () => {
  return (
    <SettingsLayout>
      <ProfileSettings />
    </SettingsLayout>
  );
};

export default SettingsPage;