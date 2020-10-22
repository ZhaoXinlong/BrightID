// @flow

import React, { useEffect, useState } from 'react';
import {
  Image,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage } from '@/utils/filesystem';
import { setPhoto, setName } from '@/actions';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

const EditProfilePhoto = () => {
  const dispatch = useDispatch();
  const { showActionSheetWithOptions } = useActionSheet();

  const id = useSelector((state) => state.user.id);

  const [profilePhoto, setProfilePhoto] = useState('');
  const photoFilename = useSelector((state) => state.user.photo.filename);

  useEffect(() => {
    if (!profilePhoto) {
      retrieveImage(photoFilename).then(setProfilePhoto);
    }
  }, [profilePhoto, photoFilename]);

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      dispatch(setPhoto({ filename }));
      setProfilePhoto(await retrieveImage(filename));
    } catch (err) {
      console.log(err);
    }
  };

  const getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      dispatch(setPhoto({ filename }));
      setProfilePhoto(await retrieveImage(filename));
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditPhoto = () => {
    showActionSheetWithOptions(
      {
        options: ['Take Photo', 'Choose From Library', 'cancel'],
        cancelButtonIndex: 2,
        title: 'Select photo',
        // message: `Flagging ${name} will negatively effect their BrightID score, and this flag might be shown to other users.`,
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          fontSize: DEVICE_LARGE ? 20 : 17,
        },
        messageTextStyle: {
          fontSize: DEVICE_LARGE ? 15 : 12,
        },
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          getPhotoFromCamera();
        } else if (buttonIndex === 1) {
          getPhotoFromLibrary();
        }
      },
    );
  };

  return (
    <View style={styles.profilePhotoContainer}>
      <TouchableOpacity
        testID="editPhoto"
        onPress={handleEditPhoto}
        accessible={true}
        accessibilityLabel="edit photo"
        style={styles.changePhotoButton}
      >
        <Image
          source={{
            uri: profilePhoto,
          }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e.error);
          }}
          accessible={true}
          accessibilityLabel="profile photo"
        />
        <Text style={styles.profilePhotoText}>Change Profile Picture</Text>
      </TouchableOpacity>
    </View>
  );
};

const EditName = () => {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.name);
  const [displayName, setDisplayName] = useState(name);

  return (
    <View style={styles.editNameContainer}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.editNameInput}
        value={displayName}
        onChangeText={setDisplayName}
        onBlur={() => {
          if (displayName.length >= 2) {
            dispatch(setName(displayName));
          } else {
            setName(name);
          }
        }}
        blurOnSubmit={true}
      />
      <View style={styles.bottomDivider} />
    </View>
  );
};

const SocialMediaLinks = () => {
  return (
    <View style={styles.socialMediaContainer}>
      <Text style={styles.label}>Social Media Link</Text>
      <View style={styles.socialMediaContainer}>
        <Text style={styles.socialMediaLink}>LinkedIn</Text>
      </View>
      <View style={styles.socialMediaContainer}>
        <Text style={styles.socialMediaLink}>Twitter</Text>
      </View>
      <View style={styles.socialMediaContainer}>
        <Text style={styles.socialMediaLink}>Medium</Text>
      </View>
      <View style={styles.bottomDivider} />
    </View>
  );
};

const ShowEditPassword = () => {
  const password = useSelector((state) => state.user.password);
  const [hidePassword, setHidePassword] = useState(true);

  // don't show this option if user does not have password
  if (!password) {
    return null;
  }

  let displayPassword = password;
  if (hidePassword) {
    displayPassword = '*'.repeat(password.length);
  }
  console.log('displayPassword', displayPassword);
  return (
    <View style={styles.showEditPasswordContainer}>
      <View style={styles.viewPasswordContainer}>
        <TouchableOpacity
          onPress={() => {
            setHidePassword(!hidePassword);
          }}
        >
          <Text style={styles.passwordText}>View Password</Text>
        </TouchableOpacity>
        <Text>{displayPassword}</Text>
      </View>
      <TouchableOpacity style={styles.changePasswordButton}>
        <Text style={styles.passwordText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EditProfileScreen = function () {
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }

  const isDrawerOpen = useIsDrawerOpen();

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="graphExplorerScreen"
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <EditProfilePhoto />
        <EditName />
        <SocialMediaLinks />
        <ShowEditPassword />
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingHorizontal: DEVICE_LARGE ? 40 : 30,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  profilePhotoContainer: {
    marginTop: DEVICE_LARGE ? 20 : 18,
  },
  changePhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#2185D0',
    marginTop: DEVICE_LARGE ? 6 : 5,
  },
  photo: {
    width: DEVICE_LARGE ? 90 : 78,
    height: DEVICE_LARGE ? 90 : 78,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  editNameContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 36 : 30,
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 11 : 10,
    color: '#B64B32',
  },
  editNameInput: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginTop: 2,
    width: '100%',
  },
  bottomDivider: {
    width: '100%',
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 1,
    marginTop: DEVICE_LARGE ? 20 : 18,
  },
  socialMediaContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 18 : 16,
  },
  socialMediaLink: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#2185D0',
  },
  showEditPasswordContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 18 : 16,
  },
  viewPasswordContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changePasswordButton: {
    marginTop: 8,
  },
  passwordText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#2185D0',
  },
  saveContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 44 : 36,
  },
  saveButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: '#5DEC9A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
  cancelButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#707070',
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
});

export default EditProfileScreen;
