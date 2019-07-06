// @flow

import * as React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { connect } from 'react-redux';

import server from '../Api/server';
import api from '../Api/BrightId';

class Apps extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Apps',
    headerRight: <View />,
  });

  componentDidMount() {
    if (this.props.navigation.state.params) { // if 'params' is defined, the user came through a deep link
      const { host, context, id } = this.props.navigation.state.params;
      const oldHost = server.baseUrl;
      let contextInfo;
      try {
        server.update(host);
        contextInfo = api.getContext(context);
      } finally {
        server.update(oldHost);
      }

      if (contextInfo && contextInfo.verification) {

        const verifications = []; // TODO: populate this from redux

        if (verifications.includes(contextInfo.verification)) {

          Alert.alert(
            'Link Verification?',
            `Do you want to allow ${context} to link the account with id ${id} to your BrightID verification?`,
            [
              {
                text: 'Yes',
                onPress: () => this.linkVerification(host, context, contextInfo, id),
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  this.props.navigation.goBack();
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'Verification not found',
            `${context} requires you to have the ${contextInfo.verification} verification.`,
            [
              {
                text: 'Dismiss',
                style: 'cancel',
                onPress: () => {
                  this.props.navigation.goBack();
                },
              }
            ]
          )
        }
      } else {
        this.props.navigation.goBack();
      }
    }
  }

  render() {
    return (
      <View style={styles.container} />
    );
  }

  linkVerification(host, context, contextInfo, id) {
    const oldHost = server.baseUrl;
    let verification;
    try {
      server.update(host);
      verification = api.getVerification(context, id);
      fetch(`${contextInfo.verificationUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(verification),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // TODO: handle fetch errors
    } finally {
      server.update(oldHost);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default connect((state) => state.main)(Apps);
