import React from 'react';
import { Helmet } from 'react-helmet';
import { SettingsLayout } from '../components/SettingsLayout';
import { ProfileSettings } from '../components/ProfileSettings';

const ProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>Profile & Account - OmniPA</title>
        <meta name="description" content="Manage your profile and account settings." />
      </Helmet>
      <SettingsLayout>
        <ProfileSettings />
      </SettingsLayout>
    </>
  );
};

export default ProfilePage;